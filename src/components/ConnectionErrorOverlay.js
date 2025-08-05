
function ConnectionErrorOverlay({ error, onRetry }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Connection Lost
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to the server. Please check your internet connection.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Error: {error}
          </p>
          <button
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectionErrorOverlay;
