import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  HelpCircle, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Clock, 
  FileText, 
  Users, 
  MessageSquarePlus 
} from 'lucide-react';

interface HelpGuideViewProps {
  onOpenReportModal: () => void;
  lang: Language;
}

export const HelpGuideView: React.FC<HelpGuideViewProps> = ({
  onOpenReportModal,
  lang,
}) => {
  const t = getTranslation(lang);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>{lang === 'ta' ? 'பயணியர் வழிகாட்டி & கொள்கை' : 'Passenger Guide & Information'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lang === 'ta' ? 'நடைமேடை வழிகாட்டி & பயண விதிமுறைகள்' : 'Boarding Bays, Concessions & Help'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              {lang === 'ta'
                ? 'பேருந்து நிலைய நடைமேடைகள், மகளிர் கட்டணமில்லா விடியல் பயணம், மற்றும் நிலைய விசாரணை எண்கள்.'
                : 'Terminal platform bay allocations, Tamil Nadu government concessions, and station inquiry desks.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenReportModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t.reportMissingBtn}</span>
          </button>
        </div>
      </div>

      {/* Terminal Boarding Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kovilpatti Anna Bus Stand */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
              KVP
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {lang === 'ta' ? 'கோவில்பட்டி புதிய அண்ணா பேருந்து நிலையம்' : 'Kovilpatti New Bus Stand (Anna BS)'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'ta' ? 'நடைமேடை ஒதுக்கீடு வழிகாட்டி' : 'Platform & Bay Allocation Guide'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 3 & 4
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'கழுகுமலை • குருவிகுளம் • சங்கரன்கோவில் • தென்காசி' : 'Kalugumalai • Kuruvikulam • Sankarankovil • Tenkasi'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'இந்த முன்னோடி வழித்தடப் பேருந்துகள் அனைத்தும் மேடை 3 மற்றும் 4-லிருந்து புறப்படுகின்றன.' : 'All pilot corridor buses towards Sankarankovil depart from Bays 3 & 4.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-slate-800 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 1 & 2
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'விருதுநகர் • மதுரை • திண்டுக்கல்' : 'Virudhunagar • Madurai • Dindigul'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'வடக்கு நோக்கிச் செல்லும் விரைவுப் பேருந்துகள்.' : 'Northbound express services via National Highway 44.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-slate-800 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 5 & 6
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'கயத்தாறு • திருநெல்வேலி • நாகர்கோவில்' : 'Kayathar • Tirunelveli • Nagercoil'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'தெற்கு நோக்கிச் செல்லும் பேருந்துகள்.' : 'Southbound highway routes.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-slate-800 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 7 & 8
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'எட்டயபுரம் • விளாத்திகுளம் • தூத்துக்குடி' : 'Ettayapuram • Vilathikulam • Thoothukudi'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'கிழக்கு நோக்கிய கடலோர மாவட்ட வழித்தடங்கள்.' : 'Eastbound coastal and taluk routes.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sankarankovil Bus Stand */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">
              SNKL
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {lang === 'ta' ? 'சங்கரன்கோவில் புதிய பேருந்து நிலையம்' : 'Sankarankovil New Bus Stand'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {lang === 'ta' ? 'நடைமேடை ஒதுக்கீடு வழிகாட்டி' : 'Platform & Bay Allocation Guide'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 1
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'குருவிகுளம் • கழுகுமலை • கோவில்பட்டி' : 'Kuruvikulam • Kalugumalai • Kovilpatti'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'கோவில்பட்டி நோக்கிச் செல்லும் பேருந்துகள் நடைமேடை 1-லிருந்து இயக்கப்படுகின்றன.' : 'Buses towards Kovilpatti corridor board at Bay 1.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-slate-800 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 2
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'சுரண்டை • தென்காசி • செங்கோட்டை' : 'Surandai • Tenkasi • Shenkottai'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'தென்காசி மாவட்ட தலைநகர் மற்றும் கேரளா எல்லை வழித்தடங்கள்.' : 'Towards Tenkasi district headquarters.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-slate-800 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 3
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'ராஜபாளையம் • ஸ்ரீவில்லிபுத்தூர் • மதுரை' : 'Rajapalayam • Srivilliputtur • Madurai'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'ராஜபாளையம் வழியாக செல்லும் வடமேற்கு வழித்தடங்கள்.' : 'North-western routes towards Rajapalayam.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
              <span className="bg-slate-800 text-white font-black text-[11px] px-2 py-0.5 rounded shrink-0">
                Bay 4
              </span>
              <div>
                <strong className="text-slate-900 block">
                  {lang === 'ta' ? 'திருவேங்கடம் • திருநெல்வேலி' : 'Thiruvenkadam • Tirunelveli'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {lang === 'ta' ? 'திருநெல்வேலி சந்திப்புக்கு செல்லும் நேரடிப் பேருந்துகள்.' : 'Direct routes towards Tirunelveli junction.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TN Government Concessions & Welfare Policies */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Users className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-base text-slate-900">
            {lang === 'ta' ? 'தமிழ்நாடு அரசு பயண சலுகைகள் & விதிமுறைகள்' : 'Tamil Nadu Transit Concessions & Policies'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-pink-50/70 border border-pink-200 rounded-2xl p-4 space-y-2">
            <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'ta' ? 'விடியல் பயணம்' : 'Vidiyal Payanam'}
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              {lang === 'ta' ? 'மகளிர் கட்டணமில்லா பேருந்து பயணம்' : 'Zero-Fare Travel for Women'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ta'
                ? 'அனைத்து TNSTC சாதாரண நகரப் பேருந்துகளில் (Ordinary Town Buses - வெள்ளை பலகை / இளஞ்சிவப்பு முத்திரை) பெண்கள், மாற்றுத்திறனாளிகள் மற்றும் திருநங்கைகளுக்கு கட்டணமில்லா பயணம் அனுமதிக்கப்படுகிறது.'
                : 'Free travel for women, trans persons, and persons with disabilities across all TNSTC Ordinary Town Buses (white destination boards). Conductor issues zero-fare ticket.'}
            </p>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'ta' ? 'மாணவர் சலுகை' : 'Student Pass'}
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              {lang === 'ta' ? 'பள்ளி மற்றும் கல்லூரி மாணவர்கள்' : 'School & College Students'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ta'
                ? 'அரசு வழங்கிய இலவச பஸ் பாஸ் வைத்துள்ள மாணவர்கள் பள்ளி மற்றும் கல்லூரிகளுக்கு இலவசமாக பயணிக்கலாம். அடையாள அட்டை அவசியம்.'
                : 'Free travel with government-issued student smart cards between residence and educational institution on designated routes.'}
            </p>
          </div>

          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
            <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'ta' ? 'மூத்த குடிமக்கள்' : 'Senior Citizens'}
            </span>
            <h3 className="font-bold text-sm text-slate-900">
              {lang === 'ta' ? 'இலவச பயண டோக்கன்கள்' : 'Senior Travel Vouchers'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ta'
                ? '60 வயதுக்கு மேற்பட்ட மூத்த குடிமக்களுக்கு TNSTC பணிமனைகளில் வழங்கப்படும் மாதாந்திர டோக்கன்கள் மூலம் கட்டணமில்லா பயணம் செய்யலாம்.'
                : 'Citizens aged 60+ can obtain monthly travel tokens from TNSTC depot counters for free travel on non-AC buses.'}
            </p>
          </div>
        </div>
      </div>

      {/* Official Inquiry Phone Numbers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Phone className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-base text-slate-900">
            {lang === 'ta' ? 'நிலைய நேரடி விசாரணை தொலைபேசி எண்கள்' : 'Official Bus Stand Inquiry Desks'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Kovilpatti Bus Stand</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">04632 - 220 222</div>
            <div className="text-[11px] text-slate-500 mt-1">Anna BS Timekeeper Desk</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Sankarankovil Stand</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">04636 - 222 345</div>
            <div className="text-[11px] text-slate-500 mt-1">New BS Control Desk</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">TNSTC Tirunelveli Division</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">0462 - 257 2585</div>
            <div className="text-[11px] text-slate-500 mt-1">Passenger Grievances</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-semibold uppercase">TNSTC Madurai Control</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">0452 - 258 0241</div>
            <div className="text-[11px] text-slate-500 mt-1">24x7 Control Room</div>
          </div>
        </div>
      </div>

      {/* Truthfulness & Verification Guarantee */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>{lang === 'ta' ? 'ரூரல்ரூட் நம்பகத்தன்மை உறுதிமொழி' : 'Our Passenger Trust Guarantee'}</span>
        </div>
        <h3 className="text-lg font-bold text-white">
          {lang === 'ta' ? 'ஏன் நாங்கள் உத்தேச GPS நேரங்களைக் காட்டுவதில்லை?' : 'Why We Never Show Fabricated Real-Time GPS'}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          {lang === 'ta'
            ? 'கிராமப்புற பேருந்துகளில் ஜி.பி.எஸ் டிராக்கர்கள் பெரும்பாலானவற்றில் பொருத்தப்படவில்லை. போலியான "நேரலை இருப்பிடம்" அல்லது "வருகை நேரம்" காட்டுவது பயணிகளை ஏமாற்றும் செயலாகும். எனவே ரூரல்ரூட் அதிகாரப்பூர்வ பணிமனை பதிவேடு மற்றும் கள ஆய்வு மூலம் சரிபார்க்கப்பட்ட அட்டவணைகளை மட்டுமே காண்பிக்கிறது.'
            : 'Many rural buses do not carry government-sanctioned real-time GPS telemetry. Showing simulated "live bus moving" animations or fake ETAs endangers passengers who may miss their essential transport. RuralRoute only displays timetable data verified through depot records and physical timekeeper boards.'}
        </p>
      </div>
    </div>
  );
};
