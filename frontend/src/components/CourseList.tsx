import type { Course } from '../services/course.service';

interface CourseListProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => Promise<void>;
  onUnpublish?: (id: string) => Promise<void>;
  isLoading?: boolean;
  isTogglingId?: string;
}

export default function CourseList({ courses, onEdit, onDelete, onPublish, onUnpublish, isLoading, isTogglingId }: CourseListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 text-lg">No courses found. Create your first course!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-gray-800 flex-1">{course.title}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                course.status === 'PUBLISHED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {course.status}
            </span>
          </div>

          {course.description && (
            <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
          )}

          <div className="text-sm text-gray-500 mb-4">
            <p>Created: {new Date(course.createdAt).toLocaleDateString()}</p>
            <p>Updated: {new Date(course.updatedAt).toLocaleDateString()}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onEdit(course)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
                  onDelete(course.id);
                }
              }}
              className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Delete
            </button>
            {course.status === 'PUBLISHED' && onUnpublish && (
              <button
                onClick={() => onUnpublish(course.id)}
                disabled={isTogglingId === course.id}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTogglingId === course.id ? 'Unpublishing...' : 'Unpublish'}
              </button>
            )}
            {course.status === 'DRAFT' && onPublish && (
              <button
                onClick={() => onPublish(course.id)}
                disabled={isTogglingId === course.id}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTogglingId === course.id ? 'Publishing...' : 'Publish'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
