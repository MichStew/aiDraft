import { useState } from "react";
import { ChevronLeft, Download, Cloud, Shield, Trash2 } from "lucide-react";

interface ExportPrivacyProps {
  onBack: () => void;
}

export function ExportPrivacy({ onBack }: ExportPrivacyProps) {
  const [cloudSync, setCloudSync] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleCloudSyncToggle = () => {
    if (!cloudSync) {
      setShowConsentModal(true);
    } else {
      setCloudSync(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    // Simulate export
    alert(`Exporting data as ${format.toUpperCase()}...`);
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      {/* Status Bar Space */}
      <div className="h-12" />
      
      {/* Header */}
      <div className="px-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl text-white tracking-tight">Export & Privacy</h1>
        </div>
      </div>

      {/* Export Data */}
      <div className="px-6 mb-6">
        <h3 className="text-white mb-4">Export Your Data</h3>
        
        <div className="space-y-3">
          <button
            onClick={() => handleExport("csv")}
            className="w-full bg-[#1C1C1E] rounded-[18px] p-4 flex items-center justify-between hover:bg-[#2C2C2E] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div className="text-left">
                <p className="text-white">Export as CSV</p>
                <p className="text-sm text-[#A6A6A6]">Spreadsheet format</p>
              </div>
            </div>
            <span className="text-[#00F0FF]">→</span>
          </button>

          <button
            onClick={() => handleExport("json")}
            className="w-full bg-[#1C1C1E] rounded-[18px] p-4 flex items-center justify-between hover:bg-[#2C2C2E] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div className="text-left">
                <p className="text-white">Export as JSON</p>
                <p className="text-sm text-[#A6A6A6]">Developer format</p>
              </div>
            </div>
            <span className="text-[#00F0FF]">→</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync */}
      <div className="px-6 mb-6">
        <h3 className="text-white mb-4">Cloud Sync</h3>
        
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div>
                <p className="text-white">Enable Cloud Sync</p>
                <p className="text-sm text-[#A6A6A6]">Backup your data</p>
              </div>
            </div>
            <button
              onClick={handleCloudSyncToggle}
              className={`w-12 h-7 rounded-full transition-colors ${
                cloudSync ? "bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF]" : "bg-[#2C2C2E]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  cloudSync ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="pt-4 border-t border-[#2C2C2E]">
            <div className="flex items-start gap-2 text-sm text-[#A6A6A6]">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Your data is encrypted end-to-end. We never share your personal information with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Info */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-[#FF3AF2]/15 to-[#00F0FF]/10 border border-[#00F0FF]/20 rounded-[18px] p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[#00F0FF] mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-white mb-2">Privacy-First Design</p>
              <p className="text-[#A6A6A6] leading-relaxed">
                All detection runs on your device. Your data never leaves your control unless you explicitly enable cloud sync.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Data */}
      <div className="px-6">
        <h3 className="text-white mb-4">Data Management</h3>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-[#FF5A6E]/10 border border-[#FF5A6E]/30 rounded-[18px] p-4 flex items-center gap-3 hover:bg-[#FF5A6E]/20 transition-colors"
        >
          <Trash2 className="w-5 h-5 text-[#FF5A6E]" />
          <div className="text-left flex-1">
            <p className="text-[#FF5A6E]">Delete All Local Data</p>
            <p className="text-sm text-[#FF5A6E]/70">This action cannot be undone</p>
          </div>
        </button>
      </div>

      {/* Cloud Sync Consent Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center mx-auto mb-4">
              <Cloud className="w-6 h-6 text-[#00F0FF]" />
            </div>
            
            <h3 className="text-xl text-white mb-3 text-center">Enable Cloud Sync?</h3>
            <p className="text-[#A6A6A6] text-sm mb-6 text-center leading-relaxed">
              Your data will be encrypted and securely stored in the cloud. You can disable this at any time.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                </div>
                <span className="text-[#A6A6A6]">End-to-end encryption</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                </div>
                <span className="text-[#A6A6A6]">Access from multiple devices</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF]" />
                </div>
                <span className="text-[#A6A6A6]">Automatic backups</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setCloudSync(true);
                  setShowConsentModal(false);
                }}
                className="w-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D] rounded-[14px] py-3"
              >
                Enable Cloud Sync
              </button>
              <button
                onClick={() => setShowConsentModal(false)}
                className="w-full bg-[#2C2C2E] text-white rounded-[14px] py-3"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-6 z-50">
          <div className="bg-[#1C1C1E] rounded-[24px] p-6 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-[#FF5A6E]/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#FF5A6E]" />
            </div>
            
            <h3 className="text-xl text-white mb-3 text-center">Delete All Data?</h3>
            <p className="text-[#A6A6A6] text-sm mb-6 text-center leading-relaxed">
              This will permanently delete all your local data including sessions, goals, and settings. This action cannot be undone.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTimeout(() => alert("All data deleted"), 300);
                }}
                className="w-full bg-[#FF5A6E] text-white rounded-[14px] py-3"
              >
                Delete All Data
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-[#2C2C2E] text-white rounded-[14px] py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
