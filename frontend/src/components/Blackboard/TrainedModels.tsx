const trainedModels = [
  {
    id: 'facial-recognition',
    title: 'Reconocimiento Facial Avanzado',
    rating: 4.8,
    reviews: 2156,
    tag: 'Premium',
    image: '/api/placeholder/300/200',
    students: 'Más de 2.5 millones'
  },
  {
    id: 'hand-recognition',
    title: 'Reconocimiento de Manos con MediaPipe',
    rating: 4.9,
    reviews: 1247,
    tag: 'Nuevo',
    image: '/api/placeholder/300/200',
    students: 'Más de 3 millones'
  },
  {
    id: 'voice-recognition',
    title: 'Reconocimiento de Voz con IA',
    rating: 4.7,
    reviews: 1123,
    tag: 'Trending',
    image: '/api/placeholder/300/200',
    students: 'Más de 800,000'
  },
  {
    id: 'object-detection',
    title: 'Detección de Objetos YOLO v8',
    rating: 4.8,
    reviews: 1456,
    tag: 'Premium',
    image: '/api/placeholder/300/200',
    students: 'Más de 1.2 millones'
  },
  {
    id: 'gesture-recognition',
    title: 'Reconocimiento de Gestos',
    rating: 4.6,
    reviews: 892,
    tag: 'Nuevo',
    image: '/api/placeholder/300/200',
    students: 'Más de 650,000'
  },
  {
    id: 'emotion-detection',
    title: 'Detección de Emociones Faciales',
    rating: 4.9,
    reviews: 1834,
    tag: 'Premium',
    image: '/api/placeholder/300/200',
    students: 'Más de 1.8 millones'
  }
]

export default function TrainedModels() {
  return (
    <section className="container-page mt-8 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-header">Modelos para Entrenar</h2>
        <button className="text-sm text-slate-600 hover:text-header transition">Ver todos</button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in delay-200">
        {trainedModels.map((model) => (
          <div key={model.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 w-full h-80 flex flex-col group">
            <div className="relative overflow-hidden rounded-t-xl">
              <img 
                src={model.image} 
                alt={model.title}
                className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-2 py-1 rounded transition-all duration-300 group-hover:bg-black/90">
                {model.students}
              </div>
              <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
                model.tag === 'Premium' ? 'bg-purple-100 text-purple-700 group-hover:bg-purple-200' :
                model.tag === 'Nuevo' ? 'bg-green-100 text-green-700 group-hover:bg-green-200' :
                'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
              }`}>
                {model.tag}
              </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-semibold text-slate-800 mb-4 h-12 line-clamp-2 group-hover:text-slate-900 transition-colors duration-300">{model.title}</h3>
              
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400 group-hover:text-yellow-500 transition-colors duration-300">★</span>
                  <span className="text-sm font-medium group-hover:text-slate-900 transition-colors duration-300">{model.rating}</span>
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300">({model.reviews.toLocaleString()})</span>
              </div>
              
              <div className="mt-auto">
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                  Ir →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
