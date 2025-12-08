#!/bin/bash

# POS System Kubernetes Deployment Script
# Domain: boburmirzo.myrestauran.uz

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== POS System Kubernetes Deployment ===${NC}"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

# Check if cluster is reachable
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Cannot connect to Kubernetes cluster.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Creating namespace...${NC}"
kubectl apply -f namespace.yaml

echo -e "${YELLOW}Step 2: Creating secrets and configmap...${NC}"
kubectl apply -f secrets.yaml
kubectl apply -f configmap.yaml

echo -e "${YELLOW}Step 3: Deploying PostgreSQL...${NC}"
kubectl apply -f postgres/

echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=pos-postgres -n pos-system --timeout=120s

echo -e "${YELLOW}Step 4: Deploying Backend...${NC}"
kubectl apply -f backend/

echo -e "${YELLOW}Waiting for Backend to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=pos-backend -n pos-system --timeout=120s

echo -e "${YELLOW}Step 5: Deploying Frontend...${NC}"
kubectl apply -f frontend/

echo -e "${YELLOW}Step 6: Creating Ingress...${NC}"
kubectl apply -f ingress.yaml

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo -e "${YELLOW}Checking status:${NC}"
kubectl get pods -n pos-system
echo ""
kubectl get svc -n pos-system
echo ""
kubectl get ingress -n pos-system
echo ""
echo -e "${GREEN}Domain: https://boburmirzo.myrestauran.uz${NC}"
echo -e "${YELLOW}Note: Make sure DNS is configured to point to your Ingress Controller IP${NC}"
