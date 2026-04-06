import React from 'react';
import { useLanguage } from '../LanguageContext';

const CalendarView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <main className="pt-24 px-6 max-w-screen-xl mx-auto">
      {/* Editorial Header Section */}
      <section className="mb-12 text-left">
        <h2 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter mb-4 max-w-2xl">
          {t.protectionSchedule.split(' ').map((word: string, i: number) => (
            <React.Fragment key={i}>
              {word === 'Proteção' || word === 'Protection' || word === 'Protección' ? (
                <span className="text-primary">{word}</span>
              ) : (
                word
              )}
              {' '}
            </React.Fragment>
          ))}
        </h2>
        <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
          {t.calendarSubtitle}
        </p>
      </section>

      {/* Bento Grid Layout for Calendar & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Calendar Container (Lg: 8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-xl p-6 lg:p-8 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-on-surface">{t.october2023}</h3>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-wider">{t.dosesScheduledMonth}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
              {/* Days Header */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="bg-slate-50 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {day}
                </div>
              ))}
              
              {/* Row 1 */}
              <div className="bg-white h-24 sm:h-32 p-2 group transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-slate-300">1</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50 relative">
                <span className="text-sm font-semibold text-on-surface">2</span>
                <div className="mt-2 p-1.5 rounded-md bg-blue-100 text-[10px] leading-tight text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Flu
                </div>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">3</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">4</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">5</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">6</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">7</span>
              </div>

              {/* Row 2 */}
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">8</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">9</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">10</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50 relative">
                <span className="text-sm font-semibold text-on-surface">11</span>
                <div className="mt-2 p-1.5 rounded-md bg-orange-100 text-[10px] leading-tight text-orange-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  COVID-19
                </div>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">12</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">13</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">14</span>
              </div>

              {/* Row 3 */}
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">15</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">16</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">17</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">18</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">19</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50/30">
                <span className="text-sm font-semibold text-on-surface">20</span>
              </div>
              <div className="bg-white h-24 sm:h-32 p-2 transition-colors hover:bg-blue-50 ring-2 ring-primary ring-inset z-10">
                <span className="text-sm font-bold text-primary">21</span>
                <div className="mt-2 p-1.5 rounded-md bg-blue-50 text-[10px] leading-tight text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  Hep B
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* List Sidebar (Lg: 4 cols) */}
        <div className="lg:col-span-4 space-y-6 pb-24">
          <div className="bg-slate-50 rounded-xl p-6 h-full flex flex-col border border-slate-100">
            <h3 className="text-xl font-bold tracking-tight text-on-surface mb-6">{t.upcomingDoses}</h3>
            <div className="flex-grow space-y-4">
              {/* Pending Item */}
              <div className="bg-white p-4 rounded-xl flex gap-4 group hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">vaccines</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-0.5">{t.pendingStatus}</span>
                  <h4 className="font-bold text-on-surface">COVID-19 Reforço</h4>
                  <p className="text-xs text-on-surface-variant font-medium">11 de Outubro, 2023</p>
                </div>
              </div>

              {/* Mandatory Item */}
              <div className="bg-white p-4 rounded-xl flex gap-4 group hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-blue-100 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">shield</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">{t.mandatoryStatus}</span>
                  <h4 className="font-bold text-on-surface">Hepatite B (3ª Dose)</h4>
                  <p className="text-xs text-on-surface-variant font-medium">21 de Outubro, 2023</p>
                </div>
              </div>

              {/* Recommended Item */}
              <div className="bg-white p-4 rounded-xl flex gap-4 group hover:shadow-md transition-all duration-300 opacity-80">
                <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">spa</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-0.5">{t.recommendedStatus}</span>
                  <h4 className="font-bold text-on-surface">HPV Quadrivalente</h4>
                  <p className="text-xs text-on-surface-variant font-medium">04 de Novembro, 2023</p>
                </div>
              </div>

              {/* Confirmed/Done Item */}
              <div className="bg-white p-4 rounded-xl flex gap-4 opacity-60">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-0.5">{t.confirmedStatus}</span>
                  <h4 className="font-bold text-on-surface line-through">Gripe Sazonal</h4>
                  <p className="text-xs text-on-surface-variant font-medium">02 de Outubro, 2023</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-4 bg-primary text-white rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95">
              <span className="material-symbols-outlined">add_circle</span>
              {t.scheduleNewDose}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CalendarView;
