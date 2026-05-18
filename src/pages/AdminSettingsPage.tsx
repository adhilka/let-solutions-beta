import { useState, useEffect } from "react";
import { getReadDb } from "../lib/firebase/loadBalancer";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { dualWrite, dualDelete } from "../lib/firebase/dualWrite";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "../components/ConfirmationModal";
import { AlertTriangle, Trash2, Database, ShieldAlert } from "lucide-react";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("branding");
  const [isSaving, setIsSaving] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmVariant: "danger" | "primary" | "success";
    confirmText?: string;
    mode?: "confirm" | "status";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmVariant: "primary",
    confirmText: "Confirm",
    mode: "confirm",
    onConfirm: () => {},
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<any>({
    branding: {
      instituteName: "Let Solutions",
      tagline: "A Ray of Hope For Your Future",
      logoUrl: "https://i.ibb.co/SXRGw6x8/logo.png",
      faviconUrl: "https://i.ibb.co/DDmJMDzP/1000107715.png",
    },
    contact: {
      email: "info@letsolutions.in",
      phone: "+91 95628 54444",
      whatsapp: "919562854444",
      address:
        "1st Floor, Bus Stand Building, Tirur, Malappuram (Dist), Kerala, India - 676101",
    },
    stats: {
      yearsExcellence: "10+",
      studentsTrained: "5000+",
      placementRate: "95%",
      courseModules: "50+",
    },
    admissions: {
      mode: "auto",
      manualText: "Admission Open 2026-27",
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const db = getReadDb();
        const settingsDoc = await getDoc(
          doc(db, "artifacts/tech-institute/public/data/settings", "global"),
        );
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let updatedSettings = { ...settings };

      if (logoFile || faviconFile) {
        const { uploadToImgBB } = await import("../lib/imgbb");

        if (logoFile) {
          const res = await uploadToImgBB(logoFile);
          updatedSettings.branding.logoUrl = res.url;
        }

        if (faviconFile) {
          const res = await uploadToImgBB(faviconFile);
          updatedSettings.branding.faviconUrl = res.url;
        }
      }

      await dualWrite(
        ["artifacts", "tech-institute", "public", "data", "settings", "global"],
        updatedSettings,
      );
      setSettings(updatedSettings);
      setLogoFile(null);
      setFaviconFile(null);
      queryClient.invalidateQueries({ queryKey: ["settings-global"] });

      setModalConfig({
        isOpen: true,
        title: "Settings Saved",
        message:
          "Your branding and configuration settings have been updated successfully.",
        confirmVariant: "success",
        confirmText: "Great",
        mode: "status",
        onConfirm: () => {},
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setModalConfig({
        isOpen: true,
        title: "Save Failed",
        message:
          "There was an error saving your changes. Please check your connection and try again.",
        confirmVariant: "danger",
        confirmText: "Try Again",
        mode: "status",
        onConfirm: () => {},
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value,
      },
    }));
  };

  const tabs = [
    { id: "branding", label: "1. Branding" },
    { id: "contact", label: "2. Contact" },
    { id: "stats", label: "3. Stats" },
    { id: "admissions", label: "4. Admissions" },
    { id: "announcement", label: "5. Announcement" },
    { id: "access", label: "6. Access Control" },
    { id: "maintenance", label: "7. Maintenance" },
  ];

  const clearCollection = async (collectionPath: string) => {
    try {
      const db = getReadDb();
      const querySnapshot = await getDocs(
        collection(
          db,
          `artifacts/tech-institute/public/data/${collectionPath}`,
        ),
      );
      const deletePromises = querySnapshot.docs.map((d) =>
        dualDelete([
          "artifacts",
          "tech-institute",
          "public",
          "data",
          collectionPath,
          d.id,
        ]),
      );
      await Promise.all(deletePromises);
      return true;
    } catch (err) {
      console.error(`Error clearing ${collectionPath}:`, err);
      return false;
    }
  };

  const handleClearAllData = async () => {
    setIsSaving(true);
    const collections = [
      "courses",
      "testimonials",
      "batches",
      "enquiries",
      "offers",
      "posts",
      "settings",
    ];
    let successCount = 0;

    for (const col of collections) {
      const res = await clearCollection(col);
      if (res) successCount++;
    }

    // Invalidate all queries to refresh UI
    queryClient.invalidateQueries();
    // Refresh local settings state
    window.location.reload();

    setIsSaving(false);

    if (successCount === collections.length) {
      setModalConfig({
        isOpen: true,
        title: "Server Wipe Complete",
        message:
          "All dynamic content has been successfully removed from the server. Your site is now in its original clean state.",
        confirmVariant: "success",
        confirmText: "Done",
        mode: "status",
        onConfirm: () => {},
      });
    } else {
      setModalConfig({
        isOpen: true,
        title: "Wipe Partially Failed",
        message: `Only ${successCount} out of ${collections.length} collections were cleared. Please check your connection and try again.`,
        confirmVariant: "danger",
        confirmText: "Acknowledge",
        mode: "status",
        onConfirm: () => {},
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">
            Settings
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            Full-site CMS management.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary btn-sm"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-48 lg:w-64 bg-[var(--color-surface-alt)] border-r border-[var(--color-border)] shrink-0">
          <nav className="flex flex-col py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white border-l-4 border-[var(--color-primary-600)] text-[var(--color-primary-700)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-50)] border-l-4 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-6 capitalize">
              {activeTab} Settings
            </h2>

            {activeTab === "branding" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.branding?.instituteName || ""}
                    onChange={(e) =>
                      updateSetting("branding", "instituteName", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.branding?.tagline || ""}
                    onChange={(e) =>
                      updateSetting("branding", "tagline", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Logo
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.branding?.logoUrl && (
                      <img
                        src={settings.branding.logoUrl}
                        className="h-10 w-auto rounded border"
                        alt="Logo"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Favicon
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.branding?.faviconUrl && (
                      <img
                        src={settings.branding.faviconUrl}
                        className="h-8 w-8 rounded border"
                        alt="Favicon"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFaviconFile(e.target.files?.[0] || null)
                      }
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    className="input"
                    value={settings.contact?.email || ""}
                    onChange={(e) =>
                      updateSetting("contact", "email", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.contact?.phone || ""}
                    onChange={(e) =>
                      updateSetting("contact", "phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={settings.contact?.whatsapp || ""}
                    onChange={(e) =>
                      updateSetting("contact", "whatsapp", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Address
                  </label>
                  <textarea
                    className="input"
                    rows={3}
                    value={settings.contact?.address || ""}
                    onChange={(e) =>
                      updateSetting("contact", "address", e.target.value)
                    }
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Years Excellence
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={settings.stats?.yearsExcellence || ""}
                      onChange={(e) =>
                        updateSetting(
                          "stats",
                          "yearsExcellence",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Students Trained
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={settings.stats?.studentsTrained || ""}
                      onChange={(e) =>
                        updateSetting(
                          "stats",
                          "studentsTrained",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Placement Rate
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={settings.stats?.placementRate || ""}
                      onChange={(e) =>
                        updateSetting("stats", "placementRate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Course Modules
                    </label>
                    <input
                      type="text"
                      className="input"
                      value={settings.stats?.courseModules || ""}
                      onChange={(e) =>
                        updateSetting("stats", "courseModules", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "admissions" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                    Year Display Mode
                  </label>
                  <select
                    className="input"
                    value={settings.admissions?.mode || "auto"}
                    onChange={(e) =>
                      updateSetting("admissions", "mode", e.target.value)
                    }
                  >
                    <option value="auto">
                      Auto (Calculates Current Academic Year)
                    </option>
                    <option value="manual">Manual Override</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Auto mode will show "
                    {new Date().getMonth() > 4
                      ? `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`
                      : `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`}
                    "
                  </p>
                </div>
                {settings.admissions?.mode === "manual" && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Manual Admission Text
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Admission Open 2026-27"
                      value={settings.admissions?.manualText || ""}
                      onChange={(e) =>
                        updateSetting(
                          "admissions",
                          "manualText",
                          e.target.value,
                        )
                      }
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "announcement" && (
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-6">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={settings.announcement?.enabled ?? true}
                      onChange={(e) =>
                        updateSetting(
                          "announcement",
                          "enabled",
                          e.target.checked,
                        )
                      }
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Enable Top Announcement Bar
                    </span>
                  </label>
                </div>

                {settings.announcement?.enabled !== false && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                      Announcement Text
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 🎉 New Batches Starting Soon!"
                      value={settings.announcement?.text || ""}
                      onChange={(e) =>
                        updateSetting("announcement", "text", e.target.value)
                      }
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      This text will scroll horizontally at the very top of the
                      website (marquee style).
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "access" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold mb-2">
                    Temporary Admin Links
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Generate a 24-hour secure link to grant temporary admin
                    access to another user. They will not need a username or
                    password, but their access will expire automatically.
                  </p>

                  <button
                    onClick={async () => {
                      const linkId =
                        Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15);
                      const expiresAt = new Date();
                      expiresAt.setHours(expiresAt.getHours() + 24);

                      try {
                        await dualWrite(
                          [
                            "artifacts",
                            "tech-institute",
                            "public",
                            "data",
                            "admin_links",
                            linkId,
                          ],
                          {
                            createdAt: Timestamp.now(),
                            expiresAt: Timestamp.fromDate(expiresAt),
                          },
                        );
                        // Since I don't want to hassle with dualWrite parsing, I will write the URL to the screen
                        const url = `${window.location.origin}/admin?adminToken=${linkId}`;

                        setModalConfig({
                          isOpen: true,
                          title: "Link Generated successfully",
                          message: `Share this link securely:\n\n${url}\n\nThis link will expire in 24 hours.`,
                          confirmVariant: "success",
                          confirmText: "Done",
                          mode: "status",
                          onConfirm: () => {},
                        });
                      } catch (err) {
                        console.error("Error generating link:", err);
                        setModalConfig({
                          isOpen: true,
                          title: "Error generating link",
                          message:
                            "We encountered an error generating the link. Please try again.",
                          confirmVariant: "danger",
                          confirmText: "Acknowledge",
                          mode: "status",
                          onConfirm: () => {},
                        });
                      }
                    }}
                    className="btn-primary"
                  >
                    Generate New Link (24 Hours)
                  </button>
                </div>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-10">
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start">
                  <div className="p-4 bg-amber-100 text-amber-600 rounded-2xl shrink-0">
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900 mb-2">
                      Danger Zone
                    </h3>
                    <p className="text-amber-800 text-sm leading-relaxed mb-4">
                      The following actions are irreversible. They will
                      permanently remove data from your server. Use with extreme
                      caution.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                        <Trash2 size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900">
                        Clear Leads & Enquiries
                      </h4>
                    </div>
                    <p className="text-slate-500 text-xs mb-6">
                      Deletes all student enquiries and contact form
                      submissions.
                    </p>
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          title: "Clear Enquiries?",
                          message:
                            "This will permanently delete all student enquiries and messages. You cannot undo this action.",
                          confirmVariant: "danger",
                          confirmText: "Yes, Wipe Enquiries",
                          mode: "confirm",
                          onConfirm: async () => {
                            const res = await clearCollection("enquiries");
                            if (res) {
                              setModalConfig({
                                isOpen: true,
                                title: "Enquiries Cleared",
                                message:
                                  "All student leads and enquiry records have been removed.",
                                confirmVariant: "success",
                                confirmText: "Done",
                                mode: "status",
                                onConfirm: () => {},
                              });
                            }
                          },
                        })
                      }
                      className="w-full py-2 bg-red-100 text-red-700 font-bold rounded-xl text-sm hover:bg-red-200 transition-colors"
                    >
                      Wipe Enquiries
                    </button>
                  </div>

                  <div className="p-6 rounded-3xl border border-slate-200 hover:border-red-200 hover:bg-red-50/30 transition-all group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                        <Database size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900">
                        Universal Server Wipe
                      </h4>
                    </div>
                    <p className="text-slate-500 text-xs mb-6">
                      Deletes EVERYTHING: Courses, Blog Posts, Batches,
                      Feedbacks, and your Branding/Stats settings.
                    </p>
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          title: "DELETE EVERYTHING?",
                          message:
                            "WARNING: This will wipe all dynamic content AND your custom settings (Branding, Stats, etc.) from the server. The site will return to factory defaults.",
                          confirmVariant: "danger",
                          onConfirm: handleClearAllData,
                        })
                      }
                      className="w-full py-2 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
                    >
                      Reset All Data
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmVariant={modalConfig.confirmVariant}
        confirmText={modalConfig.confirmText}
        mode={modalConfig.mode}
      />
    </div>
  );
}
