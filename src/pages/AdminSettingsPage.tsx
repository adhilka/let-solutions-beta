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
import { AlertTriangle, Trash2, Database, ShieldAlert, Image } from "lucide-react";
import { FAILSAFE_SETTINGS } from "../constants/failsafe";

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
      whatsappWelcomeMessage: "Hello, I would like to know more about the courses at Let Solutions.",
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
    announcement: {
      enabled: true,
      text: "🎉 New Batches for Master Diploma in Chip-Level Engineering Starting Soon!",
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

  const handleRestoreDefaultImages = async () => {
    setIsSaving(true);
    try {
      // 1. Restore Global branding logos
      const updatedGlobalSettings = {
        ...settings,
        branding: {
          ...settings.branding,
          logoUrl: FAILSAFE_SETTINGS.branding.logoUrl,
          faviconUrl: FAILSAFE_SETTINGS.branding.faviconUrl,
        }
      };

      await dualWrite(
        ["artifacts", "tech-institute", "public", "data", "settings", "global"],
        updatedGlobalSettings,
      );
      setSettings(updatedGlobalSettings);

      // 2. Restore Home Hero Image
      // We fetch current home settings first to preserve other text
      const db = getReadDb();
      const homeDoc = await getDoc(doc(db, "artifacts/tech-institute/public/data/settings", "home"));
      if (homeDoc.exists()) {
        const homeData = homeDoc.data();
        const updatedHomeData = {
          ...homeData,
          hero: {
            ...homeData.hero,
            imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            bgType: 'photo'
          }
        };
        await dualWrite(
          ["artifacts", "tech-institute", "public", "data", "settings", "home"],
          updatedHomeData
        );
      }

      queryClient.invalidateQueries({ queryKey: ["settings-global"] });
      queryClient.invalidateQueries({ queryKey: ["home-content"] });

      setModalConfig({
        isOpen: true,
        title: "All Assets Restored",
        message: "Branding logos, favicon, and home hero image have been reset to their original official links.",
        confirmVariant: "success",
        confirmText: "Done",
        mode: "status",
        onConfirm: () => {},
      });
    } catch (error) {
      console.error("Error restoring images:", error);
      alert("Failed to restore images");
    } finally {
      setIsSaving(false);
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

      <div className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-lg border border-[var(--color-border)] flex flex-col md:flex-row overflow-hidden min-h-[600px]">
        {/* Settings Sidebar */}
        <div className="w-full md:w-48 lg:w-64 bg-[#1a1a1a] border-r border-[var(--color-border)] shrink-0">
          <nav className="flex flex-col py-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white/5 border-l-4 border-[var(--color-primary-500)] text-white"
                    : "text-[var(--color-text-tertiary)] hover:bg-white/[0.02] border-l-4 border-transparent"
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
            <h2 className="text-xl font-bold mb-8 capitalize text-white italic">
              {activeTab} Configuration
            </h2>

            {activeTab === "branding" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
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
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
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
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Brand Logo
                  </label>
                  <div className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                    {settings.branding?.logoUrl && (
                      <img
                        src={settings.branding.logoUrl}
                        className="h-10 w-auto rounded border border-[var(--color-border)] bg-black/20"
                        alt="Logo"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="text-xs text-[var(--color-text-tertiary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary-900)] file:text-[var(--color-primary-400)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Favicon (Safari/Chrome Icon)
                  </label>
                  <div className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                    {settings.branding?.faviconUrl && (
                      <img
                        src={settings.branding.faviconUrl}
                        className="h-8 w-8 rounded border border-[var(--color-border)]"
                        alt="Favicon"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFaviconFile(e.target.files?.[0] || null)
                      }
                      className="text-xs text-[var(--color-text-tertiary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary-900)] file:text-[var(--color-primary-400)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Official Email
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
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Hotline Number
                  </label>
                  <input
                    type="text"
                    className="input font-mono"
                    value={settings.contact?.phone || ""}
                    onChange={(e) =>
                      updateSetting("contact", "phone", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    WhatsApp Connectivity
                  </label>
                  <input
                    type="text"
                    className="input font-mono"
                    value={settings.contact?.whatsapp || ""}
                    onChange={(e) =>
                      updateSetting("contact", "whatsapp", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Auto-Welcome Script
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Message sent when user clicks WhatsApp button"
                    value={settings.contact?.whatsappWelcomeMessage || ""}
                    onChange={(e) =>
                      updateSetting("contact", "whatsappWelcomeMessage", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Physical Address
                  </label>
                  <textarea
                    className="input min-h-[100px]"
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
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                      Experience (Years)
                    </label>
                    <input
                      type="text"
                      className="input font-mono"
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
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                      Student Alumni Count
                    </label>
                    <input
                      type="text"
                      className="input font-mono"
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
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                      Placement Metric
                    </label>
                    <input
                      type="text"
                      className="input font-mono"
                      value={settings.stats?.placementRate || ""}
                      onChange={(e) =>
                        updateSetting("stats", "placementRate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                      Curriculum Modules
                    </label>
                    <input
                      type="text"
                      className="input font-mono"
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
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                    Academic Cycle Sync
                  </label>
                  <select
                    className="input"
                    value={settings.admissions?.mode || "auto"}
                    onChange={(e) =>
                      updateSetting("admissions", "mode", e.target.value)
                    }
                  >
                    <option value="auto">
                      Auto (Dynamic Academic Year)
                    </option>
                    <option value="manual">Manual Override</option>
                  </select>
                  <p className="mt-2 text-[10px] uppercase font-bold tracking-widest text-[var(--color-text-tertiary)]">
                    Preview:{" "}
                    {new Date().getMonth() > 4
                      ? `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`
                      : `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`}
                  </p>
                </div>
                {settings.admissions?.mode === "manual" && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                      Manual Text Input
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
                <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)]">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-[var(--color-border)] text-[var(--color-primary-600)] focus:ring-[var(--color-primary-500)]"
                      checked={settings.announcement?.enabled ?? true}
                      onChange={(e) =>
                        updateSetting(
                          "announcement",
                          "enabled",
                          e.target.checked,
                        )
                      }
                    />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      Enable Emergency Announcement Bar
                    </span>
                  </label>
                </div>

                {settings.announcement?.enabled !== false && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-[var(--color-text-secondary)] mb-2 uppercase tracking-widest">
                      Marquee Status Text
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
                    <p className="mt-2 text-[10px] text-[var(--color-text-tertiary)] font-bold uppercase tracking-widest">
                      Scrolls horizontally at the vertex of the interface.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "access" && (
              <div className="space-y-6">
                <div className="bg-[var(--color-surface)] p-8 rounded-3xl border border-[var(--color-border)]">
                  <h3 className="text-lg font-bold mb-4 text-white uppercase tracking-tight">
                    Temporal Access Keys
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                    Generate an encrypted, one-time link valid for 24 hours to grant administrative 
                    oversight without credentials. Key will expire automatically upon completion 
                    of the cycle.
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
                        const url = `${window.location.origin}/admin?adminToken=${linkId}`;

                        setModalConfig({
                          isOpen: true,
                          title: "Key Generated",
                          message: `Deployment Link Created:\n\n${url}\n\nTerminates in 24 standard hours.`,
                          confirmVariant: "success",
                          confirmText: "Acknowledge",
                          mode: "status",
                          onConfirm: () => {},
                        });
                      } catch (err) {
                        console.error("Error generating link:", err);
                        setModalConfig({
                          isOpen: true,
                          title: "Encryption Failure",
                          message:
                            "The system encountered an error generating the temporal key.",
                          confirmVariant: "danger",
                          confirmText: "Retry",
                          mode: "status",
                          onConfirm: () => {},
                        });
                      }
                    }}
                    className="btn-primary w-full md:w-auto shadow-xl shadow-blue-900/20"
                  >
                    Generate Temporal Key
                  </button>
                </div>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-10">
                <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="p-4 bg-red-500/20 text-red-500 rounded-2xl shrink-0">
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">
                      Privileged Operations
                    </h3>
                    <p className="text-red-400 text-sm font-medium leading-relaxed">
                      Wipe operations are structural and irreversible. Permanent data removal 
                      from the primary cluster will occur immediately.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                  <div className="p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-red-500/50 transition-all group shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-500/10 text-red-400 rounded-xl">
                        <Trash2 size={20} />
                      </div>
                      <h4 className="font-bold text-white uppercase tracking-tight">
                        Wipe Leads
                      </h4>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-xs mb-8 leading-relaxed">
                      Purge all student enquiry records and contact metrics from the archive.
                    </p>
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          title: "Execute Wipe?",
                          message:
                            "This will permanently terminate all enquiry records from the database. This sector cannot be recovered.",
                          confirmVariant: "danger",
                          confirmText: "Execute Wipe",
                          mode: "confirm",
                          onConfirm: async () => {
                            const res = await clearCollection("enquiries");
                            if (res) {
                              setModalConfig({
                                isOpen: true,
                                title: "Archive Cleared",
                                message:
                                  "Sector purged. Enquiries have been removed.",
                                confirmVariant: "success",
                                confirmText: "Acknowledged",
                                mode: "status",
                                onConfirm: () => {},
                              });
                            }
                          },
                        })
                      }
                      className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
                    >
                      Purge Archive
                    </button>
                  </div>

                  <div className="p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-blue-500/50 transition-all group shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Image size={20} />
                      </div>
                      <h4 className="font-bold text-white uppercase tracking-tight">
                        Restore Logic
                      </h4>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-xs mb-8 leading-relaxed">
                      Re-synchronize branding assets and UI placeholders with official Tirur defaults.
                    </p>
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          title: "Restore Defaults?",
                          message: "Reverting UI anchors to factory settings. Primary text layers remain archived.",
                          confirmVariant: "primary",
                          confirmText: "Sync Defaults",
                          mode: "confirm",
                          onConfirm: handleRestoreDefaultImages,
                        })
                      }
                      className="w-full py-3 bg-blue-500/10 text-blue-400 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-blue-500/20 transition-all border border-blue-500/20"
                    >
                      Sync Defaults
                    </button>
                  </div>

                  <div className="p-8 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-red-600 transition-all group shadow-2xl col-span-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-red-600/10 text-red-500 rounded-xl">
                        <Database size={20} />
                      </div>
                      <h4 className="font-bold text-white uppercase tracking-tight">
                        Universal System Reset
                      </h4>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm mb-8 leading-relaxed">
                      Structural termination of all distributed modules. This includes courses, blog infrastructure, 
                      testimonials, and global configuration. No recovery path exists.
                    </p>
                    <button
                      onClick={() =>
                        setModalConfig({
                          isOpen: true,
                          title: "SYSTEM RESET?",
                          message:
                            "FINAL WARNING: Initiating global termination. All content structures will be destroyed.",
                          confirmVariant: "danger",
                          onConfirm: handleClearAllData,
                        })
                      }
                      className="w-full py-4 bg-red-600 text-white font-extrabold rounded-2xl text-sm uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20"
                    >
                      Initialize System Reset
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
