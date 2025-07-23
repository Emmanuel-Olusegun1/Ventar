export default function FeatureCard({ icon, title, description }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow h-full">
        <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">{title}</h3>
        <p className="text-green-700">{description}</p>
      </div>
    )
  }