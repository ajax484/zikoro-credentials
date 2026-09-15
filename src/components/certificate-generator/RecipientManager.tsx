"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Upload,
  X,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";

export interface RecipientItem {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

interface RecipientManagerProps {
  recipients: RecipientItem[];
  setRecipients: React.Dispatch<React.SetStateAction<RecipientItem[]>>;
  onBack: () => void;
  onContinue: () => void;
  maxFreeLimit?: number;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({
  recipients,
  setRecipients,
  onBack,
  onContinue,
  maxFreeLimit = 10,
}) => {
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Add individual recipient
  const handleAddRecipient = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      setErrorMessage("Please enter a recipient name");
      return;
    }

    if (recipients.length >= maxFreeLimit) {
      setErrorMessage(
        `Free tier limit reached (${maxFreeLimit} recipients max). Remove an existing recipient or sign up for unlimited issuance.`
      );
      return;
    }

    // Split into first and last name
    const parts = trimmedName.split(" ");
    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ") || "";

    const newRecipient: RecipientItem = {
      id: Math.random().toString(36).substring(2, 9),
      firstName,
      lastName,
      email: emailInput.trim() || undefined,
    };

    setRecipients((prev) => [...prev, newRecipient]);
    setNameInput("");
    setEmailInput("");
  };

  // Remove recipient
  const handleRemove = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
    setErrorMessage(null);
  };

  // Clear all
  const handleClearAll = () => {
    setRecipients([]);
    setErrorMessage(null);
  };

  // CSV/Excel upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        if (!rows || rows.length === 0) {
          setErrorMessage("The uploaded file contains no data rows.");
          return;
        }

        const remainingSlots = maxFreeLimit - recipients.length;
        if (remainingSlots <= 0) {
          setErrorMessage(`Free batch limit of ${maxFreeLimit} recipients already reached.`);
          return;
        }

        const imported: RecipientItem[] = [];
        for (const row of rows) {
          if (imported.length >= remainingSlots) break;

          const fullName =
            row["Full Name"] ||
            row["Name"] ||
            row["Recipient Name"] ||
            row["name"] ||
            row["Recipient"] ||
            "";

          let firstName = row["First Name"] || row["first_name"] || row["FirstName"] || "";
          let lastName = row["Last Name"] || row["last_name"] || row["LastName"] || "";

          if (!firstName && fullName) {
            const parts = String(fullName).trim().split(" ");
            firstName = parts[0];
            lastName = parts.slice(1).join(" ");
          }

          const email =
            row["Email"] ||
            row["email"] ||
            row["Recipient Email"] ||
            row["E-mail"] ||
            undefined;

          if (firstName) {
            imported.push({
              id: Math.random().toString(36).substring(2, 9),
              firstName: String(firstName).trim(),
              lastName: String(lastName).trim(),
              email: email ? String(email).trim() : undefined,
            });
          }
        }

        if (imported.length === 0) {
          setErrorMessage("Could not detect any valid names in the uploaded sheet.");
          return;
        }

        setRecipients((prev) => [...prev, ...imported]);
      } catch (err: any) {
        console.error("Error reading spreadsheet:", err);
        setErrorMessage("Failed to parse spreadsheet. Please use a CSV or XLSX file.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const isLimitReached = recipients.length >= maxFreeLimit;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Add Certificate Recipients
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter recipient names individually or import from a spreadsheet. The free generator supports up to{" "}
          <strong className="text-purple-700 font-bold">{maxFreeLimit} recipients</strong> per batch.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* Progress & Quota Tracker */}
        <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              {recipients.length}/{maxFreeLimit}
            </div>
            <div>
              <p className="text-xs font-bold text-purple-900">
                {recipients.length} of {maxFreeLimit} Free Recipients Added
              </p>
              <p className="text-[11px] text-purple-700">
                {isLimitReached
                  ? "Maximum free batch reached. Upgrade to issue thousands."
                  : `${maxFreeLimit - recipients.length} free slot(s) remaining`}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-48 bg-purple-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(recipients.length / maxFreeLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddRecipient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-7">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Recipient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={isLimitReached}
                placeholder="e.g. Sarah Connor or Dr. Alan Grant"
                className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  disabled={isLimitReached}
                  placeholder="recipient@example.com"
                  className="flex-1 text-sm px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={isLimitReached || !nameInput.trim()}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 disabled:opacity-50 transition shrink-0"
                >
                  <UserPlus className="size-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* CSV Import divider & button */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 flex-wrap gap-3">
          <div className="text-xs text-gray-500">
            Have a list? Import recipients directly from an Excel or CSV file.
          </div>

          <label
            className={`flex items-center gap-2 px-3.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-purple-300 transition cursor-pointer shadow-sm ${
              isLimitReached ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <FileSpreadsheet className="size-4 text-emerald-600" />
            <span>Upload CSV / Excel</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLimitReached}
            />
          </label>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="size-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Recipient Chips / List */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 min-h-[140px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Recipients to Generate ({recipients.length})
            </span>
            {recipients.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] font-medium text-red-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {recipients.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              No recipients added yet. Type a name above or upload a CSV file to populate the list.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs"
                >
                  <span className="font-semibold text-gray-800">
                    {recipient.firstName} {recipient.lastName}
                  </span>
                  {recipient.email && (
                    <span className="text-gray-400 text-[11px]">({recipient.email})</span>
                  )}
                  <button
                    onClick={() => handleRemove(recipient.id)}
                    className="text-gray-400 hover:text-red-500 ml-1 transition"
                    title="Remove"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Editor</span>
          </button>

          <button
            onClick={onContinue}
            disabled={recipients.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-custom-gradient-start to-custom-gradient-end hover:opacity-95 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Continue to Download ({recipients.length})</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
