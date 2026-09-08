export default function HeroSection() {
  return (
    <section className="w-full bg-gradient-to-br from-green-50 via-white to-green-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 px-5 items-center">
        {/* Text Section */}
        <div className="space-y-4">
          <div className="inline-block">
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold shadow-sm">🌿 Kebun Raya Pertama di Indonesia</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-green-900 leading-tight">
            Kebun Raya <span className="text-green-600">Eka Karya</span> Bali
          </h1>

          <div className="h-1 w-20 bg-gradient-to-r from-green-600 to-green-400 rounded-full"></div>

          <p className="text-gray-700 leading-relaxed text-sm">
            Terletak di Kabupaten Tabanan, Bali berjarak sekitar 60 km dari Denpasar. Didirikan pada <strong>15 Juli 1959</strong>, merupakan Kebun Raya pertama yang didirikan oleh putra bangsa Indonesia.
          </p>

          <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded-r-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-green-900 font-semibold text-xs">Ketinggian: 1.250 - 1.450 mdpl</p>
                <p className="text-green-700 text-xs mt-0.5">Kawasan konservasi ex-situ tumbuhan pegunungan tropika Kawasan Timur Indonesia</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded-r-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-blue-900 font-semibold text-xs">Luas Kawasan: 157.5 hektar</p>
                <p className="text-blue-700 text-xs mt-0.5">Berkembang dari luas awal 50 ha menjadi kawasan konservasi yang luas</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a href="/virtual-tour"
              className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold text-sm group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Mulai Virtual Tour 360°
            </a>
          </div>
        </div>

        {/* Image Section - Enhanced */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-green-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
          <div className="relative">
            <img src="/CandiKR.jpg" alt="Candi Bentar - Gerbang Kebun Raya Eka Karya Bali" className="rounded-2xl shadow-2xl w-full object-cover transform group-hover:scale-[1.02] transition-transform duration-300" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-2xl">
              <p className="text-white font-semibold text-lg">Candi Bentar</p>
              <p className="text-green-100 text-sm">Gerbang Ikonik Kebun Raya Eka Karya</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
