interface Props {
  params: {
    courseId: string;
  };
}

export default function InstructorLessonsPage({ params }: Props): JSX.Element {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Quản lý bài học</h1>
      <p className="mt-2 text-sm text-gray-600">Course: {params.courseId}</p>
      <p className="mt-2 text-sm text-gray-600">
        Danh sách lesson sẽ dùng cursor pagination và thao tác CRUD thông qua REST API.
      </p>
    </main>
  );
}
