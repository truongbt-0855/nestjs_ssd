import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, type Course, type CreateCourseDto, type UpdateCourseDto } from '../../../services/course.service';
import CourseForm from '../../../components/CourseForm';
import CourseList from '../../../components/CourseList';

type ViewMode = 'list' | 'create' | 'edit';

export default function AdminCoursesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses = [], isLoading, error: fetchError } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCourseDto) => courseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setViewMode('list');
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create course');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseDto }) =>
      courseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setViewMode('list');
      setSelectedCourse(undefined);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to update course');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setError(null);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to delete course');
    },
  });

  const handleCreate = () => {
    setSelectedCourse(undefined);
    setViewMode('create');
    setError(null);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setViewMode('edit');
    setError(null);
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleSubmit = async (data: CreateCourseDto | UpdateCourseDto) => {
    if (viewMode === 'create') {
      await createMutation.mutateAsync(data as CreateCourseDto);
    } else if (viewMode === 'edit' && selectedCourse) {
      await updateMutation.mutateAsync({ id: selectedCourse.id, data });
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedCourse(undefined);
    setError(null);
  };

  useEffect(() => {
    if (fetchError) {
      setError('Failed to load courses');
    }
  }, [fetchError]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Course Management</h1>
        <p className="text-gray-600">Create, edit, and manage your courses</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {viewMode === 'list' && (
        <>
          <div className="mb-6">
            <button
              onClick={handleCreate}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              + Create New Course
            </button>
          </div>

          <CourseList
            courses={courses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </>
      )}

      {(viewMode === 'create' || viewMode === 'edit') && (
        <CourseForm
          course={selectedCourse}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
