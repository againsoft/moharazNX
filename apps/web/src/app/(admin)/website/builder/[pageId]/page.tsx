import { PageBuilder } from "@/components/website/builder/page-builder";

export default async function WebsiteBuilderPage({ params }: { params: Promise<{ pageId: string }> }) {
  const { pageId } = await params;
  return <PageBuilder pageId={pageId} />;
}
