export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl mb-6 shadow-2xl">
          <span className="text-5xl">🎨</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Artisan Connect
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Connecting local artisans with buyers across Nigeria
        </p>
        <div className="flex gap-4 justify-center">
          {/* ✅ Fixed: Added <a> opening tag */}
          <a
            href="/auth/signup"
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Get Started
          </a>

          {/* ✅ Fixed: Added <a> opening tag */}
          <a
            href="/search"
            className="px-8 py-4 border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all"
          >
            Browse Artisans
          </a>
        </div>
      </div>
    </div>
  );
}