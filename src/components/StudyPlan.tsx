interface Resource {
  title: string;
  url: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Exercise {
  question: string;
  type: string;
  hint?: string;
}

interface Section {
  topic: string;
  timeRequired: string;
  description: string;
  prerequisites: string[];
  resources: Resource[];
  exercises: Exercise[];
}

interface StudyPlanProps {
  plan: {
    title: string;
    sections: Section[];
  };
}

export default function StudyPlan({ plan }: StudyPlanProps) {
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center mb-8">{plan.title}</h1>
      
      <div className="space-y-8">
        {plan.sections.map((section, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold">{section.topic}</h2>
              <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-3 py-1 rounded-full">
                {section.timeRequired}
              </span>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-300">{section.description}</p>
              </div>

              {/* Prerequisites */}
              {section.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Prerequisites</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                    {section.prerequisites.map((prereq, idx) => (
                      <li key={idx}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              <div>
                <h3 className="text-lg font-medium mb-2">Study Resources</h3>
                <div className="space-y-3">
                  {section.resources.map((resource, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex-grow"
                      >
                        {resource.title}
                      </a>
                      <span className={`text-sm px-2 py-1 rounded ${
                        resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                        resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {resource.difficulty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              <div>
                <h3 className="text-lg font-medium mb-2">Practice Exercises</h3>
                <div className="space-y-4">
                  {section.exercises.map((exercise, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="font-medium mb-2">{exercise.question}</p>
                      <div className="flex gap-2 text-sm">
                        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                          {exercise.type}
                        </span>
                        {exercise.hint && (
                          <div className="group relative">
                            <button className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
                              Hint
                            </button>
                            <div className="hidden group-hover:block absolute bottom-full mb-2 p-2 bg-white dark:bg-gray-800 rounded shadow-lg w-64">
                              {exercise.hint}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 