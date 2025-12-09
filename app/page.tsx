export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-white to-[#FFF8F0] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#C75B39] to-[#D97642] rounded-3xl mb-6 shadow-2xl">
          <span className="text-5xl">🎨</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Artisan Connect
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Connecting local artisans with buyers across Nigeria
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/signup"
            className="px-8 py-4 bg-gradient-to-r from-[#C75B39] to-[#D97642] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </a>

          <a
            href="/search"
            className="px-8 py-4 border-2 border-[#C75B39] text-[#C75B39] rounded-xl font-semibold hover:bg-[#FAF7F2] transition-all"
          >
            Browse Artisans
          </a>
        </div>

        <p className="text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-[#C75B39] font-semibold hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}