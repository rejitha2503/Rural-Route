import React from 'react';
import { X, Bus, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { Language } from '../types';

interface CorridorAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CorridorAboutModal: React.FC<CorridorAboutModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-2xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-xl overflow-hidden border border-slate-200 my-8 animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="about-modal-title" className="text-base font-bold text-slate-900">
                About RuralRoute (ரூரல்ரூட்)
              </h3>
              <p className="text-xs text-slate-500">
                Pilot Corridor: Kovilpatti ↔ Sankarankovil (Tamil Nadu)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700 leading-relaxed">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 space-y-1">
            <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Project Mission & Pilot Scope</span>
            </h4>
            <p className="text-xs text-slate-600">
              RuralRoute is a passenger-first transit information prototype designed for rural Tamil Nadu travelers. The pilot area covers the <strong>Kovilpatti ↔ Sankarankovil</strong> corridor (via Kalugumalai, Kuruvikulam, and Ilayarasanendal).
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Data Reliability & Integrity Rules
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Sample Pilot Data:</strong> All timetables and platform numbers shown in this initial version are illustrative demo records. Passengers must verify official schedules at the local depot or station timekeeper.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>No Fabricated GPS / ETAs:</strong> We do not show live moving bus locations without authorized GPS telemetry feeds. Map coordinates represent physical bus stop locations on OpenStreetMap only.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Connecting Buses:</strong> Calculations at interchange junctions (like Kalugumalai) are sample estimates based on recorded stage arrival buffers. Connections are not guaranteed.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Crowdsource Reporting:</strong> Passengers can report missing or changed bus timings directly into the review queue for field verification.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
            <h4 className="font-bold text-slate-800">
              தமிழ் விளக்கம் (Tamil Note)
            </h4>
            <p className="text-slate-600">
              கிராமப்புற பயணிகளுக்கு நம்பகமான பேருந்து விவரங்களை வழங்குவதே இந்த தளத்தின் நோக்கமாகும். தற்போதுள்ள அட்டவணைகள் மாதிரி தரவுகளாக மட்டுமே வழங்கப்பட்டுள்ளன. பயணத்திற்கு முன் கோவில்பட்டி மற்றும் சங்கரன்கோவில் பேருந்து நிலைய நேரக் கண்காணிப்பாளரிடம் உறுதிப்படுத்தவும்.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
