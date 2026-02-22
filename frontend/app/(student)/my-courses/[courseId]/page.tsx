interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function StudentMyCoursePage({ params }: Props) {
  const resolvedParams = await params;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Khóa học đã mua</h1>
      <p className="mt-2 text-sm text-gray-600">Course: {resolvedParams.courseId}</p>
      <p className="mt-2 text-sm text-gray-600">Danh sách bài học chỉ mở khi Student đã sở hữu khóa học.</p>
    </main>
  );
}
