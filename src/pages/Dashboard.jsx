import React, { useEffect, useState } from "react";
import { useQueryStore } from "../stores/queries";
import { useMutationStore } from "../stores/mutations";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

const Dashboard = () => {
  const { user, webhooks, fetchWebhooks, loading, error } = useQueryStore();
  const { createWebhook, deleteWebhook } = useMutationStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ actions: [], costPerEvent: 1 });

  useEffect(() => {
    if (user) {
      fetchWebhooks();
    }
  }, [user, fetchWebhooks]);

  const getInitials = (username) =>
    username
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const parseActionsSummary = (actionsJson) => {
    try {
      const actions = JSON.parse(actionsJson);
      return actions.map((action) => action.type).join(" & ");
    } catch {
      return "Unknown actions";
    }
  };

  const handleCreate = async () => {
    await createWebhook(formData);
    setShowCreateModal(false);
    setFormData({ actions: [], costPerEvent: 1 });
  };

  const columns = [
    {
      accessorKey: "userId",
      header: "User ID",
    },
    {
      accessorKey: "userAvatar",
      header: "User Avatar",
      cell: ({ row }) => (
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-semibold">
          {row.original.userAvatar}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
    },
    {
      accessorKey: "actions",
      header: "What is Generated",
      cell: ({ row }) => parseActionsSummary(row.original.actions),
    },
    {
      id: "actionsColumn",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => alert("Edit modal not implemented")}
          >
            Edit
          </button>
          <button
            className="text-sm text-red-500 hover:underline"
            onClick={async () => {
              if (confirm("Delete webhook?")) {
                await deleteWebhook(row.original.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const data = webhooks.map((webhook) => ({
    ...webhook,
    userId: user?.id || "",
    userAvatar: user ? getInitials(user.username) : "",
  }));

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!user) {
    return (
      <div className="text-center py-20">
        Please{" "}
        <Link to="/login" className="text-primary">
          login
        </Link>{" "}
        to access the dashboard.
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {loading && <Loader />}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 py-20 px-4 sm:px-12 lg:px-24 xl:px-40 w-full text-gray-700 dark:text-white bg-white dark:bg-gray-900"
      >
        <h1 className="text-3xl sm:text-4xl font-medium">Veyno Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-white/75 max-w-md text-center">
          Your credits: {user.credits} | Manage your webhooks and view
          analytics.
        </p>
        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-full mb-4"
        >
          Create Webhook
        </button>

        <div className="w-full max-w-6xl overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border-b p-2 text-left font-medium"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {webhooks.length === 0 && (
            <p className="text-center mt-4">No webhooks yet.</p>
          )}
        </div>
      </motion.div>

      {/* Create Webhook Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl mb-4">Create Webhook</h2>
            <div className="space-y-4">
              <input
                type="number"
                placeholder="Cost per Event"
                value={formData.costPerEvent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    costPerEvent: Number(e.target.value),
                  })
                }
                className="w-full border rounded px-2 py-1"
              />
              {/* TODO: Add dynamic action inputs */}
              <button
                onClick={handleCreate}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default Dashboard;
