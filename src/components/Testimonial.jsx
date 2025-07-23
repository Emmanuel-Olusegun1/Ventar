export default function Testimonial({ quote, author, role }) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <p className="text-green-700 italic mb-4">"{quote}"</p>
        <div className="flex items-center">
          <div className="bg-green-600 w-10 h-10 rounded-full"></div>
          <div className="ml-4">
            <p className="font-bold text-green-800">{author}</p>
            <p className="text-green-600 text-sm">{role}</p>
          </div>
        </div>
      </div>
    )
  }