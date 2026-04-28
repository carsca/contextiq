export default function SuggestionsPage() {
  const suggestions = [
    {
      id: 1,
      patternType: "Study Block",
      suggestion: "Schedule a short recovery break after long study sessions.",
      confidence: "High",
      explanation:
        "The system detected an extended study block with limited activity switching. This pattern may indicate strong focus, but it can also lead to fatigue if repeated without breaks.",
      evidence:
        "Feature signals: long session duration, study-heavy category distribution, low activity switching.",
      limitation:
        "This suggestion is based on logged activity data only. It does not know your actual energy level or assignment deadlines.",
    },
    {
      id: 2,
      patternType: "Routine Imbalance",
      suggestion: "Add a social or non-study activity to balance your day.",
      confidence: "Medium",
      explanation:
        "The pattern model found that most of today’s activity was concentrated in study and productivity categories, with little social or entertainment time logged.",
      evidence:
        "Feature signals: high productivity ratio, low social activity frequency, narrow category spread.",
      limitation:
        "The system may miss activities that were not manually logged.",
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-2">Suggestions</h1>
      <p className="text-sm text-gray-600 mb-8">
        Recommendations generated from extracted behavior features and pattern
        detection results.
      </p>

      <div className="bg-white border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-2">Suggestion Engine Overview</h2>
        <p className="text-sm text-gray-600">
          ContextIQ uses a two-stage pipeline. First, activity logs are converted
          into behavioral features such as session length, category balance,
          activity switching, and routine consistency. Then, the project&apos;s
          custom pattern model uses those features to identify behavior patterns
          and generate explainable suggestions.
        </p>
      </div>

      <div className="space-y-6">
        {suggestions.map((item) => (
          <div key={item.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Pattern: {item.patternType}
                </p>
                <h2 className="text-xl font-bold">{item.suggestion}</h2>
              </div>

              <span className="h-fit border rounded-full px-3 py-1 text-sm font-medium">
                {item.confidence}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">Why?</h3>
                <p className="text-sm text-gray-600">{item.explanation}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Evidence Used</h3>
                <p className="text-sm text-gray-600">{item.evidence}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-1">Limitation</h3>
                <p className="text-sm text-gray-600">{item.limitation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}