import { Stack } from "@mantine/core";
import type { CustomNextPage } from "next";
import { DashboardLayout } from "src/layout";
import { PageContent } from "src/component/PageContent";
import { PageContainer } from "src/component/PageContainer";
import { RichEditor } from "src/component/RichEditor";

const Editor: CustomNextPage = () => {
  return (
    <PageContainer title="Editor" fluid>
      <Stack spacing="xl">
        <PageContent title="Editor">
          <RichEditor />
        </PageContent>
      </Stack>
    </PageContainer>
  );
};

Editor.getLayout = DashboardLayout;

export default Editor;
