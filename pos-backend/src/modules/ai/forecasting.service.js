const tf = require('@tensorflow/tfjs-node');
const ss = require('simple-statistics');
const logger = require('../../shared/utils/logger');

/**
 * AI Forecasting Service using TensorFlow.js
 * Provides advanced sales and inventory predictions
 */
class ForecastingService {
    constructor() {
        this.salesModel = null;
        this.inventoryModel = null;
        this.modelReady = false;
    }

    /**
     * Normalize data for neural network
     */
    normalize(data) {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        return {
            normalized: data.map(v => (v - min) / range),
            min,
            max,
            range
        };
    }

    /**
     * Denormalize predictions
     */
    denormalize(value, min, range) {
        return value * range + min;
    }

    /**
     * Create sequences for time series prediction
     */
    createSequences(data, sequenceLength = 7) {
        const sequences = [];
        const targets = [];

        for (let i = 0; i < data.length - sequenceLength; i++) {
            sequences.push(data.slice(i, i + sequenceLength));
            targets.push(data[i + sequenceLength]);
        }

        return { sequences, targets };
    }

    /**
     * Build LSTM model for time series forecasting
     */
    buildLSTMModel(sequenceLength = 7) {
        const model = tf.sequential();

        // LSTM layers
        model.add(tf.layers.lstm({
            units: 50,
            returnSequences: true,
            inputShape: [sequenceLength, 1]
        }));

        model.add(tf.layers.dropout({ rate: 0.2 }));

        model.add(tf.layers.lstm({
            units: 30,
            returnSequences: false
        }));

        model.add(tf.layers.dropout({ rate: 0.2 }));

        // Dense output
        model.add(tf.layers.dense({ units: 1 }));

        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mse']
        });

        return model;
    }

    /**
     * Train sales prediction model
     */
    async trainSalesModel(historicalSales, epochs = 50) {
        try {
            const sequenceLength = 7; // Use 7 days to predict next day

            // Normalize data
            const { normalized, min, max, range } = this.normalize(historicalSales);

            // Create sequences
            const { sequences, targets } = this.createSequences(normalized, sequenceLength);

            if (sequences.length < 10) {
                logger.warn('Not enough data for training, using simple forecast');
                return null;
            }

            // Convert to tensors
            const xs = tf.tensor3d(sequences.map(s => s.map(v => [v])));
            const ys = tf.tensor2d(targets.map(t => [t]));

            // Build and train model
            this.salesModel = this.buildLSTMModel(sequenceLength);

            await this.salesModel.fit(xs, ys, {
                epochs,
                batchSize: 32,
                validationSplit: 0.2,
                shuffle: true,
                callbacks: {
                    onEpochEnd: (epoch, logs) => {
                        if (epoch % 10 === 0) {
                            logger.info(`Sales model training - Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}`);
                        }
                    }
                }
            });

            // Store normalization params
            this.salesNormParams = { min, max, range };
            this.modelReady = true;

            // Cleanup
            xs.dispose();
            ys.dispose();

            logger.info('Sales prediction model trained successfully');
            return true;
        } catch (error) {
            logger.error('Error training sales model:', error);
            return null;
        }
    }

    /**
     * Predict future sales using trained model
     */
    async predictSales(recentSales, daysToPredict = 7) {
        try {
            if (!this.salesModel || !this.modelReady) {
                // Fallback to simple forecasting
                return this.simpleMovingAverageForecast(recentSales, daysToPredict);
            }

            const { min, range } = this.salesNormParams;
            const predictions = [];
            let currentSequence = recentSales.slice(-7).map(v => (v - min) / range);

            for (let i = 0; i < daysToPredict; i++) {
                const input = tf.tensor3d([currentSequence.map(v => [v])]);
                const prediction = this.salesModel.predict(input);
                const predValue = prediction.dataSync()[0];

                // Denormalize
                const actualValue = this.denormalize(predValue, min, range);
                predictions.push(Math.max(0, Math.round(actualValue)));

                // Update sequence for next prediction
                currentSequence = [...currentSequence.slice(1), predValue];

                input.dispose();
                prediction.dispose();
            }

            return {
                predictions,
                confidence: this.calculateConfidence(recentSales),
                method: 'lstm'
            };
        } catch (error) {
            logger.error('Error predicting sales:', error);
            return this.simpleMovingAverageForecast(recentSales, daysToPredict);
        }
    }

    /**
     * Simple Moving Average forecast (fallback)
     */
    simpleMovingAverageForecast(data, days = 7) {
        const windowSize = Math.min(7, data.length);
        const recentData = data.slice(-windowSize);

        // Calculate moving average and trend
        const mean = ss.mean(recentData);
        const trend = this.calculateTrend(recentData);

        const predictions = [];
        for (let i = 1; i <= days; i++) {
            // Apply trend
            const prediction = mean + (trend * i);
            predictions.push(Math.max(0, Math.round(prediction)));
        }

        return {
            predictions,
            confidence: this.calculateConfidence(data) * 0.7, // Lower confidence for simple method
            method: 'moving_average'
        };
    }

    /**
     * Calculate trend using linear regression
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;

        const x = data.map((_, i) => i);
        const regression = ss.linearRegression(x.map((xi, i) => [xi, data[i]]));
        return regression.m; // slope
    }

    /**
     * Calculate confidence score based on data consistency
     */
    calculateConfidence(data) {
        if (data.length < 7) return 0.3;

        const stdDev = ss.standardDeviation(data);
        const mean = ss.mean(data);
        const cv = mean > 0 ? stdDev / mean : 1; // Coefficient of variation

        // Lower CV = more consistent = higher confidence
        const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));
        return parseFloat(confidence.toFixed(2));
    }

    /**
     * Predict inventory needs
     */
    async predictInventoryNeeds(productId, consumptionHistory, currentStock, reorderPoint) {
        try {
            // Calculate average daily consumption
            const avgConsumption = ss.mean(consumptionHistory);
            const stdDev = ss.standardDeviation(consumptionHistory);

            // Days until stockout
            const daysUntilStockout = currentStock / (avgConsumption || 1);

            // Predict consumption for next 30 days
            const predictedConsumption = [];
            const trend = this.calculateTrend(consumptionHistory);

            for (let i = 1; i <= 30; i++) {
                const predicted = avgConsumption + (trend * i);
                predictedConsumption.push(Math.max(0, Math.round(predicted)));
            }

            // Calculate optimal reorder quantity (EOQ formula)
            const annualDemand = avgConsumption * 365;
            const orderingCost = 50000; // UZS - estimated ordering cost
            const holdingCost = 1000; // UZS per unit per year - estimated
            const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);

            // Safety stock calculation
            const leadTimeDays = 3; // Estimated supplier lead time
            const safetyStock = Math.ceil(stdDev * 1.65 * Math.sqrt(leadTimeDays)); // 95% service level

            return {
                productId,
                currentStock,
                avgDailyConsumption: Math.round(avgConsumption),
                daysUntilStockout: Math.round(daysUntilStockout),
                predictedConsumption,
                recommendedOrderQuantity: Math.round(eoq),
                safetyStock,
                reorderPoint: Math.max(reorderPoint, safetyStock + (avgConsumption * leadTimeDays)),
                needsReorder: currentStock <= reorderPoint,
                urgency: daysUntilStockout <= 3 ? 'critical' : daysUntilStockout <= 7 ? 'high' : 'normal'
            };
        } catch (error) {
            logger.error('Error predicting inventory needs:', error);
            return null;
        }
    }

    /**
     * Analyze sales patterns (hourly, daily, weekly)
     */
    analyzeSalesPatterns(orders) {
        // Hourly distribution
        const hourlyDistribution = new Array(24).fill(0);
        const dailyDistribution = new Array(7).fill(0);
        const dailyRevenue = new Array(7).fill(0);

        orders.forEach(order => {
            const date = new Date(order.createdAt);
            const hour = date.getHours();
            const day = date.getDay();
            const total = parseFloat(order.bills?.totalWithTax || order.bills?.total || 0);

            hourlyDistribution[hour]++;
            dailyDistribution[day]++;
            dailyRevenue[day] += total;
        });

        // Find peak hours
        const peakHours = hourlyDistribution
            .map((count, hour) => ({ hour, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map(p => p.hour);

        // Find peak days
        const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
        const peakDays = dailyDistribution
            .map((count, day) => ({ day: dayNames[day], count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        return {
            hourlyDistribution,
            dailyDistribution: dayNames.map((name, i) => ({
                day: name,
                orders: dailyDistribution[i],
                revenue: Math.round(dailyRevenue[i])
            })),
            peakHours,
            peakDays,
            avgOrdersPerHour: Math.round(orders.length / 24),
            avgRevenuePerDay: Math.round(ss.mean(dailyRevenue))
        };
    }

    /**
     * Menu performance analysis
     */
    analyzeMenuPerformance(orders) {
        const productStats = {};

        orders.forEach(order => {
            if (!order.items) return;

            order.items.forEach(item => {
                const productId = item.productId || item.id;
                if (!productStats[productId]) {
                    productStats[productId] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0,
                        orderCount: 0
                    };
                }

                productStats[productId].quantity += item.quantity || 1;
                productStats[productId].revenue += (item.price || 0) * (item.quantity || 1);
                productStats[productId].orderCount++;
            });
        });

        const products = Object.entries(productStats)
            .map(([id, stats]) => ({
                id,
                ...stats,
                avgQuantityPerOrder: parseFloat((stats.quantity / stats.orderCount).toFixed(2))
            }))
            .sort((a, b) => b.revenue - a.revenue);

        // Categorize products by performance
        const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
        const avgRevenue = totalRevenue / products.length;

        const stars = products.filter(p => p.revenue > avgRevenue * 1.5);
        const steady = products.filter(p => p.revenue >= avgRevenue * 0.5 && p.revenue <= avgRevenue * 1.5);
        const underperformers = products.filter(p => p.revenue < avgRevenue * 0.5);

        return {
            topSellers: products.slice(0, 10),
            bottomSellers: products.slice(-5).reverse(),
            stars: stars.map(p => p.name),
            steady: steady.map(p => p.name),
            underperformers: underperformers.map(p => p.name),
            recommendations: this.generateMenuRecommendations(products, stars, underperformers)
        };
    }

    /**
     * Generate menu recommendations
     */
    generateMenuRecommendations(products, stars, underperformers) {
        const recommendations = [];

        if (stars.length > 0) {
            recommendations.push({
                type: 'promotion',
                message: `"${stars[0].name}" eng ko'p sotilmoqda. Combo taklif qilishni o'ylab ko'ring.`,
                priority: 'high'
            });
        }

        if (underperformers.length > 0) {
            recommendations.push({
                type: 'review',
                message: `"${underperformers[0].name}" kam sotilmoqda. Narxini yoki taqdimotini ko'rib chiqing.`,
                priority: 'medium'
            });
        }

        const avgPrice = ss.mean(products.map(p => p.revenue / p.quantity));
        const highPriceProducts = products.filter(p => (p.revenue / p.quantity) > avgPrice * 1.5 && p.quantity < 10);

        if (highPriceProducts.length > 0) {
            recommendations.push({
                type: 'pricing',
                message: `${highPriceProducts.length} ta qimmat mahsulotlar kam sotilmoqda. Narxni optimallashtiring.`,
                priority: 'medium'
            });
        }

        return recommendations;
    }

    /**
     * Customer analytics
     */
    analyzeCustomerBehavior(orders) {
        const customerOrders = {};

        orders.forEach(order => {
            const customerId = order.customerDetails?.phone || 'unknown';
            if (!customerOrders[customerId]) {
                customerOrders[customerId] = {
                    orders: [],
                    totalSpent: 0,
                    visits: 0
                };
            }

            customerOrders[customerId].orders.push(order);
            customerOrders[customerId].totalSpent += parseFloat(order.bills?.totalWithTax || 0);
            customerOrders[customerId].visits++;
        });

        const customers = Object.entries(customerOrders)
            .map(([id, data]) => ({
                id,
                ...data,
                avgOrderValue: data.totalSpent / data.visits
            }))
            .filter(c => c.id !== 'unknown')
            .sort((a, b) => b.totalSpent - a.totalSpent);

        // Customer segments
        const totalCustomers = customers.length;
        const repeatCustomers = customers.filter(c => c.visits > 1).length;
        const loyalCustomers = customers.filter(c => c.visits > 5).length;

        const avgOrderValue = ss.mean(customers.map(c => c.avgOrderValue)) || 0;
        const avgVisits = ss.mean(customers.map(c => c.visits)) || 0;

        return {
            totalCustomers,
            repeatCustomers,
            repeatRate: totalCustomers > 0 ? ((repeatCustomers / totalCustomers) * 100).toFixed(1) : 0,
            loyalCustomers,
            loyaltyRate: totalCustomers > 0 ? ((loyalCustomers / totalCustomers) * 100).toFixed(1) : 0,
            avgOrderValue: Math.round(avgOrderValue),
            avgVisitsPerCustomer: avgVisits.toFixed(1),
            topCustomers: customers.slice(0, 10).map(c => ({
                phone: c.id,
                totalSpent: Math.round(c.totalSpent),
                visits: c.visits,
                avgOrderValue: Math.round(c.avgOrderValue)
            })),
            customerLifetimeValue: Math.round(avgOrderValue * avgVisits)
        };
    }

    /**
     * Calculate RFM (Recency, Frequency, Monetary) scores for customer
     * R: 1-5 (5 = most recent)
     * F: 1-5 (5 = most frequent)
     * M: 1-5 (5 = highest spend)
     */
    calculateRFMScore(customer, percentiles) {
        // Recency score (lower days = higher score)
        let recency = 1;
        if (customer.daysSinceLastVisit <= percentiles.recency.p20) recency = 5;
        else if (customer.daysSinceLastVisit <= percentiles.recency.p40) recency = 4;
        else if (customer.daysSinceLastVisit <= percentiles.recency.p60) recency = 3;
        else if (customer.daysSinceLastVisit <= percentiles.recency.p80) recency = 2;

        // Frequency score (higher visits = higher score)
        let frequency = 1;
        if (customer.visits >= percentiles.frequency.p80) frequency = 5;
        else if (customer.visits >= percentiles.frequency.p60) frequency = 4;
        else if (customer.visits >= percentiles.frequency.p40) frequency = 3;
        else if (customer.visits >= percentiles.frequency.p20) frequency = 2;

        // Monetary score (higher spend = higher score)
        let monetary = 1;
        if (customer.totalSpent >= percentiles.monetary.p80) monetary = 5;
        else if (customer.totalSpent >= percentiles.monetary.p60) monetary = 4;
        else if (customer.totalSpent >= percentiles.monetary.p40) monetary = 3;
        else if (customer.totalSpent >= percentiles.monetary.p20) monetary = 2;

        return {
            recency,
            frequency,
            monetary,
            score: `${recency}${frequency}${monetary}`,
            total: recency + frequency + monetary
        };
    }

    /**
     * Calculate percentiles for RFM analysis
     */
    calculatePercentiles(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const len = sorted.length;
        return {
            p20: sorted[Math.floor(len * 0.2)] || 0,
            p40: sorted[Math.floor(len * 0.4)] || 0,
            p60: sorted[Math.floor(len * 0.6)] || 0,
            p80: sorted[Math.floor(len * 0.8)] || 0,
            p90: sorted[Math.floor(len * 0.9)] || 0,
            median: sorted[Math.floor(len * 0.5)] || 0
        };
    }

    /**
     * Segment customer into 7 categories
     * VIP, Power User, Loyal, Regular, Casual, New, Inactive/Churned
     */
    segmentCustomer(customer, percentiles, now = new Date()) {
        const daysSinceLastVisit = customer.daysSinceLastVisit;
        const daysSinceFirstVisit = customer.daysSinceFirstVisit;
        const visits = customer.visits;
        const totalSpent = customer.totalSpent;

        // Inactive/Churned: No order in 90+ days
        if (daysSinceLastVisit >= 90) {
            return 'inactive';
        }

        // New: First visit within 30 days
        if (daysSinceFirstVisit <= 30 && visits === 1) {
            return 'new';
        }

        // VIP: High spend (>90th percentile) AND above median frequency
        if (totalSpent >= percentiles.monetary.p90 && visits >= percentiles.frequency.median) {
            return 'vip';
        }

        // Power User: High frequency (>90th percentile)
        if (visits >= percentiles.frequency.p90) {
            return 'powerUser';
        }

        // Loyal: 6+ visits
        if (visits >= 6) {
            return 'loyal';
        }

        // Regular: 2-5 visits
        if (visits >= 2 && visits <= 5) {
            return 'regular';
        }

        // Casual: 1-2 visits, active (< 90 days)
        return 'casual';
    }

    /**
     * Calculate churn risk score (0-100)
     * Higher score = higher risk of churning
     */
    calculateChurnRisk(customer, avgOrderValue, avgVisitFrequency) {
        const daysSinceLastVisit = customer.daysSinceLastVisit;
        const visitFrequency = customer.visitFrequency || 0;
        const totalSpent = customer.totalSpent;

        // Base risk from days since last visit
        let riskScore = 0;

        if (daysSinceLastVisit >= 90) {
            riskScore = 90; // Very high risk
        } else if (daysSinceLastVisit >= 60) {
            riskScore = 70;
        } else if (daysSinceLastVisit >= 45) {
            riskScore = 50;
        } else if (daysSinceLastVisit >= 30) {
            riskScore = 30;
        } else if (daysSinceLastVisit >= 14) {
            riskScore = 15;
        } else {
            riskScore = 5;
        }

        // Adjust based on visit frequency (lower frequency = higher risk)
        if (visitFrequency < avgVisitFrequency * 0.5) {
            riskScore += 10;
        } else if (visitFrequency > avgVisitFrequency * 1.5) {
            riskScore -= 10;
        }

        // Adjust based on spending (higher spend = lower risk due to engagement)
        if (totalSpent > avgOrderValue * 10) {
            riskScore -= 5;
        }

        // Clamp to 0-100
        riskScore = Math.max(0, Math.min(100, riskScore));

        // Calculate potential loss
        const potentialLoss = Math.round(customer.avgOrderValue * Math.max(1, customer.visits / 3));

        // Determine risk level
        let riskLevel = 'low';
        if (riskScore >= 70) riskLevel = 'high';
        else if (riskScore >= 40) riskLevel = 'medium';

        return {
            score: Math.round(riskScore),
            daysSinceLastVisit,
            potentialLoss,
            riskLevel,
            lastVisitDate: customer.lastVisitDate
        };
    }

    /**
     * Analyze customer segments with 7 categories
     */
    analyzeCustomerSegments(orders) {
        const now = new Date();
        const customerOrders = {};

        // Group orders by customer
        orders.forEach(order => {
            const customerId = order.customerDetails?.phone || 'unknown';
            if (customerId === 'unknown') return;

            if (!customerOrders[customerId]) {
                customerOrders[customerId] = {
                    orders: [],
                    totalSpent: 0,
                    visits: 0,
                    firstVisit: new Date(order.createdAt),
                    lastVisit: new Date(order.createdAt)
                };
            }

            const orderDate = new Date(order.createdAt);
            customerOrders[customerId].orders.push(order);
            customerOrders[customerId].totalSpent += parseFloat(order.bills?.totalWithTax || 0);
            customerOrders[customerId].visits++;

            if (orderDate < customerOrders[customerId].firstVisit) {
                customerOrders[customerId].firstVisit = orderDate;
            }
            if (orderDate > customerOrders[customerId].lastVisit) {
                customerOrders[customerId].lastVisit = orderDate;
            }
        });

        // Process customers with additional metrics
        const customers = Object.entries(customerOrders)
            .map(([id, data]) => {
                const daysSinceFirstVisit = Math.floor((now - data.firstVisit) / (1000 * 60 * 60 * 24));
                const daysSinceLastVisit = Math.floor((now - data.lastVisit) / (1000 * 60 * 60 * 24));
                const visitFrequency = daysSinceFirstVisit > 0 ? data.visits / daysSinceFirstVisit * 30 : data.visits; // visits per 30 days

                return {
                    id,
                    phone: id,
                    totalSpent: data.totalSpent,
                    visits: data.visits,
                    avgOrderValue: data.totalSpent / data.visits,
                    firstVisitDate: data.firstVisit.toISOString(),
                    lastVisitDate: data.lastVisit.toISOString(),
                    daysSinceFirstVisit,
                    daysSinceLastVisit,
                    visitFrequency
                };
            })
            .sort((a, b) => b.totalSpent - a.totalSpent);

        if (customers.length === 0) {
            return this.getEmptySegmentResult();
        }

        // Calculate percentiles for segmentation
        const percentiles = {
            recency: this.calculatePercentiles(customers.map(c => c.daysSinceLastVisit)),
            frequency: this.calculatePercentiles(customers.map(c => c.visits)),
            monetary: this.calculatePercentiles(customers.map(c => c.totalSpent))
        };

        // Calculate averages for churn risk
        const avgOrderValue = ss.mean(customers.map(c => c.avgOrderValue)) || 0;
        const avgVisitFrequency = ss.mean(customers.map(c => c.visitFrequency)) || 0;

        // Segment all customers
        const segments = {
            vip: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 },
            powerUser: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 },
            loyal: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 },
            regular: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 },
            casual: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 },
            new: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 },
            inactive: { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 }
        };

        customers.forEach(customer => {
            const segment = this.segmentCustomer(customer, percentiles, now);
            const rfm = this.calculateRFMScore(customer, percentiles);
            const churnRisk = this.calculateChurnRisk(customer, avgOrderValue, avgVisitFrequency);

            const enrichedCustomer = {
                ...customer,
                segment,
                rfm,
                churnRisk
            };

            segments[segment].customers.push(enrichedCustomer);
            segments[segment].totalRevenue += customer.totalSpent;
            segments[segment].count++;
        });

        // Calculate averages for each segment
        Object.keys(segments).forEach(key => {
            if (segments[key].count > 0) {
                segments[key].avgSpend = Math.round(segments[key].totalRevenue / segments[key].count);
                segments[key].totalRevenue = Math.round(segments[key].totalRevenue);
            }
        });

        // Calculate segment distribution for chart
        const totalCustomers = customers.length;
        const segmentDistribution = Object.entries(segments).map(([name, data]) => ({
            name,
            value: data.count,
            percentage: totalCustomers > 0 ? ((data.count / totalCustomers) * 100).toFixed(1) : 0,
            totalRevenue: data.totalRevenue,
            avgSpend: data.avgSpend,
            color: this.getSegmentColor(name)
        }));

        return {
            totalCustomers,
            segments,
            segmentDistribution,
            percentiles,
            summary: {
                highValueCustomers: segments.vip.count + segments.powerUser.count,
                atRiskCustomers: segments.inactive.count,
                growthPotential: segments.regular.count + segments.casual.count,
                newCustomers: segments.new.count
            }
        };
    }

    /**
     * Get segment color for visualization
     */
    getSegmentColor(segment) {
        const colors = {
            vip: '#FFD700',      // Gold
            powerUser: '#8B5CF6', // Purple
            loyal: '#3B82F6',     // Blue
            regular: '#22C55E',   // Green
            casual: '#06B6D4',    // Cyan
            new: '#14B8A6',       // Teal
            inactive: '#EF4444'   // Red
        };
        return colors[segment] || '#9CA3AF';
    }

    /**
     * Get empty segment result for no data scenario
     */
    getEmptySegmentResult() {
        const emptySegment = { customers: [], totalRevenue: 0, count: 0, avgSpend: 0 };
        return {
            totalCustomers: 0,
            segments: {
                vip: { ...emptySegment },
                powerUser: { ...emptySegment },
                loyal: { ...emptySegment },
                regular: { ...emptySegment },
                casual: { ...emptySegment },
                new: { ...emptySegment },
                inactive: { ...emptySegment }
            },
            segmentDistribution: [],
            percentiles: {},
            summary: {
                highValueCustomers: 0,
                atRiskCustomers: 0,
                growthPotential: 0,
                newCustomers: 0
            }
        };
    }

    /**
     * Get churn risk analysis for all at-risk customers
     */
    analyzeChurnRisk(orders) {
        const segmentData = this.analyzeCustomerSegments(orders);
        const allCustomers = Object.values(segmentData.segments)
            .flatMap(s => s.customers);

        // Filter customers with churn risk
        const atRiskCustomers = allCustomers
            .filter(c => c.churnRisk && c.churnRisk.score >= 30)
            .sort((a, b) => b.churnRisk.score - a.churnRisk.score);

        // Calculate total potential loss
        const totalPotentialLoss = atRiskCustomers.reduce((sum, c) => sum + c.churnRisk.potentialLoss, 0);

        // Group by risk level
        const riskGroups = {
            high: atRiskCustomers.filter(c => c.churnRisk.riskLevel === 'high'),
            medium: atRiskCustomers.filter(c => c.churnRisk.riskLevel === 'medium'),
            low: atRiskCustomers.filter(c => c.churnRisk.riskLevel === 'low')
        };

        return {
            totalAtRisk: atRiskCustomers.length,
            totalPotentialLoss: Math.round(totalPotentialLoss),
            riskGroups: {
                high: {
                    count: riskGroups.high.length,
                    potentialLoss: riskGroups.high.reduce((s, c) => s + c.churnRisk.potentialLoss, 0),
                    customers: riskGroups.high.slice(0, 10).map(c => ({
                        phone: c.phone,
                        riskScore: c.churnRisk.score,
                        daysSinceLastVisit: c.churnRisk.daysSinceLastVisit,
                        potentialLoss: c.churnRisk.potentialLoss,
                        totalSpent: Math.round(c.totalSpent),
                        visits: c.visits
                    }))
                },
                medium: {
                    count: riskGroups.medium.length,
                    potentialLoss: riskGroups.medium.reduce((s, c) => s + c.churnRisk.potentialLoss, 0),
                    customers: riskGroups.medium.slice(0, 10).map(c => ({
                        phone: c.phone,
                        riskScore: c.churnRisk.score,
                        daysSinceLastVisit: c.churnRisk.daysSinceLastVisit,
                        potentialLoss: c.churnRisk.potentialLoss,
                        totalSpent: Math.round(c.totalSpent),
                        visits: c.visits
                    }))
                },
                low: {
                    count: riskGroups.low.length,
                    potentialLoss: riskGroups.low.reduce((s, c) => s + c.churnRisk.potentialLoss, 0)
                }
            },
            insights: this.generateChurnInsights(riskGroups, totalPotentialLoss)
        };
    }

    /**
     * Generate churn-related insights
     */
    generateChurnInsights(riskGroups, totalPotentialLoss) {
        const insights = [];

        if (riskGroups.high.length > 0) {
            insights.push({
                type: 'critical',
                message: `${riskGroups.high.length} ta mijoz yo'qolish xavfi yuqori. Jami yo'qotish: ${riskGroups.high.reduce((s, c) => s + c.churnRisk.potentialLoss, 0).toLocaleString()} so'm`,
                action: 'Shaxsiy takliflar yuboring'
            });
        }

        if (riskGroups.medium.length > 5) {
            insights.push({
                type: 'warning',
                message: `${riskGroups.medium.length} ta mijoz o'rtacha xavf darajasida`,
                action: 'Chegirma kampaniyasi o\'tkazing'
            });
        }

        if (totalPotentialLoss > 1000000) {
            insights.push({
                type: 'info',
                message: `Jami yo'qotish xavfi: ${totalPotentialLoss.toLocaleString()} so'm`,
                action: 'Mijozlarni qaytarish strategiyasini ishlab chiqing'
            });
        }

        return insights;
    }

    /**
     * Generate retention strategies based on segments
     */
    generateRetentionStrategies(orders) {
        const segmentData = this.analyzeCustomerSegments(orders);
        const strategies = [];

        // VIP retention
        if (segmentData.segments.vip.count > 0) {
            strategies.push({
                segment: 'vip',
                segmentName: 'VIP mijozlar',
                targetCount: segmentData.segments.vip.count,
                priority: 'high',
                strategies: [
                    {
                        type: 'exclusive_event',
                        title: 'Maxsus tadbir',
                        description: 'VIP mijozlar uchun maxsus kechki taom yoki degustatsiya',
                        expectedImpact: '+15% retention',
                        cost: 'O\'rtacha'
                    },
                    {
                        type: 'personal_service',
                        title: 'Shaxsiy xizmat',
                        description: 'Shaxsiy menejir tayinlash va tezkor rezervatsiya',
                        expectedImpact: '+20% satisfaction',
                        cost: 'Past'
                    }
                ]
            });
        }

        // Inactive customer win-back
        if (segmentData.segments.inactive.count > 0) {
            const avgInactiveSpend = segmentData.segments.inactive.avgSpend;
            strategies.push({
                segment: 'inactive',
                segmentName: 'Faol emas mijozlar',
                targetCount: segmentData.segments.inactive.count,
                priority: 'critical',
                potentialRecovery: Math.round(avgInactiveSpend * segmentData.segments.inactive.count * 0.2),
                strategies: [
                    {
                        type: 'win_back_discount',
                        title: '25% chegirma',
                        description: '90+ kun kelmaganlar uchun qaytish chegirmasi',
                        expectedImpact: '10-15% qaytish',
                        cost: 'O\'rtacha',
                        smsTemplate: 'Sizni sog\'indik! 25% chegirma bilan qaytib keling. Kod: QAYTISH25'
                    },
                    {
                        type: 'personal_call',
                        title: 'Shaxsiy qo\'ng\'iroq',
                        description: 'Yuqori qiymatli yo\'qolgan mijozlarga qo\'ng\'iroq',
                        expectedImpact: '20-30% qaytish',
                        cost: 'Past'
                    }
                ]
            });
        }

        // Regular customer upgrade
        if (segmentData.segments.regular.count > 0) {
            strategies.push({
                segment: 'regular',
                segmentName: 'Muntazam mijozlar',
                targetCount: segmentData.segments.regular.count,
                priority: 'medium',
                strategies: [
                    {
                        type: 'loyalty_program',
                        title: 'Bonus dasturi',
                        description: 'Har 10 ta tashrifda 1 ta bepul taom',
                        expectedImpact: '+25% frequency',
                        cost: 'O\'rtacha'
                    },
                    {
                        type: 'referral',
                        title: 'Do\'stini taklif qil',
                        description: 'Do\'stini olib kelsa ikkalasiga 15% chegirma',
                        expectedImpact: '+10% new customers',
                        cost: 'Past'
                    }
                ]
            });
        }

        // Casual customer engagement
        if (segmentData.segments.casual.count > 0) {
            strategies.push({
                segment: 'casual',
                segmentName: 'Tasodifiy mijozlar',
                targetCount: segmentData.segments.casual.count,
                priority: 'medium',
                strategies: [
                    {
                        type: 'first_visit_followup',
                        title: 'Ikkinchi tashrifga taklif',
                        description: '7 kun ichida qaytsa 10% chegirma',
                        expectedImpact: '+30% return rate',
                        cost: 'Past',
                        smsTemplate: 'Tashrifingiz uchun rahmat! 7 kun ichida qaytib keling - 10% chegirma. Kod: QAYTISH10'
                    }
                ]
            });
        }

        // New customer onboarding
        if (segmentData.segments.new.count > 0) {
            strategies.push({
                segment: 'new',
                segmentName: 'Yangi mijozlar',
                targetCount: segmentData.segments.new.count,
                priority: 'high',
                strategies: [
                    {
                        type: 'welcome_bonus',
                        title: 'Xush kelibsiz bonus',
                        description: 'Birinchi buyurtmadan keyin 500 bonus ball',
                        expectedImpact: '+40% second visit',
                        cost: 'Past'
                    },
                    {
                        type: 'menu_recommendation',
                        title: 'Tavsiya etilgan taomlar',
                        description: 'Eng yaxshi taomlarni tavsiya qiluvchi SMS',
                        expectedImpact: '+15% order value',
                        cost: 'Minimal'
                    }
                ]
            });
        }

        // Power User appreciation
        if (segmentData.segments.powerUser.count > 0) {
            strategies.push({
                segment: 'powerUser',
                segmentName: 'Faol mijozlar',
                targetCount: segmentData.segments.powerUser.count,
                priority: 'high',
                strategies: [
                    {
                        type: 'speed_service',
                        title: 'Tez xizmat',
                        description: 'Oldindan buyurtma va tez tayyorlov',
                        expectedImpact: '+25% satisfaction',
                        cost: 'Past'
                    },
                    {
                        type: 'surprise_upgrade',
                        title: 'Kutilmagan sovg\'a',
                        description: 'Vaqti-vaqti bilan bepul ichimlik yoki desert',
                        expectedImpact: '+35% loyalty',
                        cost: 'O\'rtacha'
                    }
                ]
            });
        }

        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        strategies.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return {
            strategies,
            summary: {
                totalStrategies: strategies.length,
                criticalActions: strategies.filter(s => s.priority === 'critical').length,
                highPriorityActions: strategies.filter(s => s.priority === 'high').length,
                totalTargetCustomers: strategies.reduce((sum, s) => sum + s.targetCount, 0)
            },
            generatedAt: new Date().toISOString()
        };
    }

    /**
     * Predict sales with confidence intervals
     */
    async predictSalesWithConfidence(recentSales, daysToPredict = 7) {
        const basePrediction = await this.predictSales(recentSales, daysToPredict);

        // Calculate confidence intervals (±15% default)
        const predictions = basePrediction.predictions.map((predicted, index) => {
            const confidenceMultiplier = 0.15 * (1 + index * 0.02); // Increase uncertainty for later days
            return {
                day: index + 1,
                predicted,
                low: Math.round(predicted * (1 - confidenceMultiplier)),
                high: Math.round(predicted * (1 + confidenceMultiplier)),
                confidence: basePrediction.confidence * (1 - index * 0.02)
            };
        });

        return {
            predictions,
            totalPredicted: predictions.reduce((sum, p) => sum + p.predicted, 0),
            totalLow: predictions.reduce((sum, p) => sum + p.low, 0),
            totalHigh: predictions.reduce((sum, p) => sum + p.high, 0),
            avgConfidence: basePrediction.confidence,
            method: basePrediction.method
        };
    }

    /**
     * Generate AI insights summary
     */
    async generateInsights(orders, inventoryData) {
        const insights = [];

        // Sales analysis
        if (orders.length > 0) {
            const recentOrders = orders.slice(-30);
            const olderOrders = orders.slice(-60, -30);

            const recentRevenue = recentOrders.reduce((sum, o) => sum + parseFloat(o.bills?.totalWithTax || 0), 0);
            const olderRevenue = olderOrders.reduce((sum, o) => sum + parseFloat(o.bills?.totalWithTax || 0), 0);

            if (olderRevenue > 0) {
                const growth = ((recentRevenue - olderRevenue) / olderRevenue) * 100;

                if (growth > 10) {
                    insights.push({
                        type: 'positive',
                        category: 'sales',
                        title: 'Savdo o\'smoqda',
                        message: `So'nggi 30 kun ichida savdo ${growth.toFixed(1)}% ga oshdi`,
                        icon: 'trending_up'
                    });
                } else if (growth < -10) {
                    insights.push({
                        type: 'warning',
                        category: 'sales',
                        title: 'Savdo tushmoqda',
                        message: `So'nggi 30 kun ichida savdo ${Math.abs(growth).toFixed(1)}% ga tushdi`,
                        icon: 'trending_down',
                        action: 'Marketing kampaniyasini ko\'rib chiqing'
                    });
                }
            }

            // Peak hour insight
            const patterns = this.analyzeSalesPatterns(orders);
            insights.push({
                type: 'info',
                category: 'operations',
                title: 'Eng band vaqtlar',
                message: `${patterns.peakHours.map(h => `${h}:00`).join(', ')} soatlarida eng ko'p buyurtmalar`,
                icon: 'schedule'
            });
        }

        // Inventory insights
        if (inventoryData && inventoryData.length > 0) {
            const lowStock = inventoryData.filter(i => i.currentStock <= i.minStock);
            const outOfStock = inventoryData.filter(i => i.currentStock === 0);

            if (outOfStock.length > 0) {
                insights.push({
                    type: 'critical',
                    category: 'inventory',
                    title: 'Mahsulotlar tugadi',
                    message: `${outOfStock.length} ta mahsulot omborda yo'q`,
                    icon: 'inventory_2',
                    action: 'Zudlik bilan buyurtma bering'
                });
            }

            if (lowStock.length > 0) {
                insights.push({
                    type: 'warning',
                    category: 'inventory',
                    title: 'Kam qolgan mahsulotlar',
                    message: `${lowStock.length} ta mahsulot kam qoldi`,
                    icon: 'warning',
                    action: 'Buyurtma rejasini tekshiring'
                });
            }
        }

        return {
            insights,
            generatedAt: new Date().toISOString(),
            dataQuality: orders.length > 100 ? 'high' : orders.length > 30 ? 'medium' : 'low'
        };
    }
}

module.exports = new ForecastingService();
