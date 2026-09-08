export default function YoutubeSection() {
  return (
    <div className="w-full bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Judul */}
        <h2 className="text-3xl font-bold text-[#6C584C] mb-3">
          Informasi Virtual Tour
        </h2>

        {/* Garis 1 elemen */}
        <div
          className="mb-10"
          style={{
            height: "4px",
            width: "300px",
            background: "linear-gradient(to right, #6C584C 0 80px, #6C584C66 80px 300px)"
          }}
        ></div>

        {/* 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          <div>
            <p className="text-gray-700 leading-relaxed">
              Nikmati pengalaman menjelajahi Kebun Raya Eka Karya Bedugul secara virtual. 
              Video ini memberikan gambaran lengkap mulai dari pintu masuk, taman-taman 
              tematik, hingga berbagai fasilitas dan spot menarik yang ada di Kebun Raya.
            </p>
          </div>

          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/036okznzHrM?si=iaxpYCzjrSF6MCuM"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}
