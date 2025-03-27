import React, { useEffect, useState } from "react";
import BottomNav from "../components/shared/BottomNav";
import { enqueueSnackbar } from "notistack";
import { getAllUsers } from "../https/index"; // API chaqiriqlari uchun

const SuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    document.title = "POS | Super Admin";
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      enqueueSnackbar("Failed to fetch users", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden p-6">
      <h1 className="text-2xl font-bold text-[#f5f5f5] mb-6">
        Super Admin Panel
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[#383838]">
          <thead>
            <tr className="bg-[#262626] text-[#f5f5f5]">
              <th className="py-3 px-6 border border-[#383838]">Name</th>
              <th className="py-3 px-6 border border-[#383838]">Email</th>
              <th className="py-3 px-6 border border-[#383838]">Role</th>
              <th className="py-3 px-6 border border-[#383838]">Token</th>
              <th className="py-3 px-6 border border-[#383838]">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center text-[#ababab] py-4">
                  Loading users...
                </td>
              </tr>
            ) : users && users.length > 0 ? (
              users.map((user, index) => (
                <tr
                  key={user.id || index}
                  className="text-[#f5f5f5] text-center hover:bg-[#383838]"
                >
                  <td className="py-3 px-6 border border-[#383838]">
                    {user.name}
                  </td>
                  <td className="py-3 px-6 border border-[#383838]">
                    {user.email}
                  </td>
                  <td className="py-3 px-6 border border-[#383838]">
                    {user.role}
                  </td>
                  <td className="py-3 px-6 border border-[#383838] flex items-center justify-center gap-2">
                    <span className="truncate max-w-[100px]">
                      {user.token ? user.token.slice(0, 6) + "..." : "No Token"}
                    </span>
                    {user.token && (
                      <button
                        onClick={() => setSelectedToken(user.token)}
                        className="px-3 py-1 text-white rounded-lg shadow-md transition duration-300"
                      >
                        View
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-6 border border-[#383838]">{`${user.status}`}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-[#ababab] py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BottomNav />

      {/* 🔹 Modal for Token View */}
      {selectedToken && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#262626] p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
            <h2 className="text-xl font-bold text-[#f5f5f5] mb-4">
              User Token
            </h2>
            <p className="text-[#f5f5f5] bg-[#383838] p-3 rounded-md break-all">
              {selectedToken}
            </p>
            <button
              onClick={() => setSelectedToken(null)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdmin;
