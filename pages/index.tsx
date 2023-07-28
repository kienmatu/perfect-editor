import { Text, Button, Group, Box, Textarea, LoadingOverlay, Radio, Divider } from '@mantine/core';
import { Grid } from '@mantine/core';
import { useState } from 'react';
import { showSuccessNotification } from '../utils/Notification';
import { useKeywords, useAI } from '../utils/Storage';
import { IconTool } from '@tabler/icons-react';
import Link from 'next/link';

import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Status } from '../lib';
import { RichEditor } from '../components/RichEditor';

export default function HomePage() {
  const [btnSaveClickCount, setBtnSaveClickCount] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState(Status.IDLE);
  const [keywords, setKeywords] = useKeywords();
  const [AIedition, setAIedition] = useAI('python');

  const handleSaveButtonClick = () => {
    setBtnSaveClickCount((c) => c + 1);
    showSuccessNotification('Đã lưu', 'Đã lưu lại nội dung vào bộ nhớ.');
  };

  const handleAnalyzeButtonClick = () => {
    setAnalyzeStatus((s) => Status.STARTED);
  };
  const handleChangeAI = (v: string) => {
    setAIedition((s) => v);
  };
  // @ts-ignore: Unreachable code error
  const handleKeywordsChange = ({ target }) => {
    const text = target?.value;
    if (text !== undefined && text !== null) {
      setKeywords(text);
    }
  };
  return (
    <>
      <LoadingOverlay visible={analyzeStatus !== Status.IDLE} overlayBlur={2} />
      <Grid style={{ maxWidth: '100%' }}>
        <Grid.Col span="auto" mt="xl" ml="xl">
          <RichEditor
            enableLinter={false}
            setStatus={setAnalyzeStatus}
            status={analyzeStatus}
            btnSaveClickCount={btnSaveClickCount}
            keywords={keywords}
            AI={AIedition}
          ></RichEditor>
        </Grid.Col>
        <Grid.Col span="content" px="md">
          <Grid style={{ width: '100%' }}>
            <Grid.Col span="auto">
              <ColorSchemeToggle />
              <Text inherit variant="gradient" display="block" align="center" component="span">
                Perfect Editor A.I
              </Text>
              <Text inherit variant="text" display="block" component="span">
                Kiểm tra trong 1 đoạn văn có chứa từ trùng lặp hay không.
                <br />
                Check luôn lỗi dấu câu.
              </Text>
              <Text inherit variant="text" display="block" component="span">
                Từ khóa tìm kiếm sẽ được{' '}
                <span style={{ backgroundColor: '#fdd', borderBottom: '1px solid #f22' }}>
                  bôi đỏ.
                </span>
              </Text>
              <Text inherit variant="text" display="block" component="span">
                Từ bị lặp sẽ được{' '}
                <span style={{ backgroundColor: 'rgba(255, 217, 0, 0.5)' }}>bôi vàng.</span>
              </Text>
              <Divider my="md" variant="dotted" />
              <Link href="/manual">
                <Text color="blue">Check tay</Text>
              </Link>
              <Divider
                my="md"
                variant="dotted"
                labelPosition="left"
                label={
                  <>
                    <IconTool size={12} />
                    <Box ml={5}>Tools</Box>
                  </>
                }
              />
              <Radio.Group
                name="favoriteAI"
                label="Phiên bản AI"
                description="Bản AI 2 chậm hơn nhưng chính xác hơn."
                withAsterisk
                onChange={handleChangeAI}
              >
                <Group mt="xs">
                  <Radio value="node" checked={AIedition === 'node'} label="AI 1" />
                  <Radio value="python" checked={AIedition === 'python'} label="AI 2" />
                </Group>
              </Radio.Group>
              <Group mt="xl">
                <Button onClick={handleAnalyzeButtonClick}>Chạy AI</Button>
                <Button color="orange" onClick={handleSaveButtonClick}>
                  Lưu nháp
                </Button>
              </Group>
              <Group mt="xl">
                <Box maw={700}>
                  {/* <Group mb={5}>
                    <Button variant="outline" color="green" onClick={toggle}>
                      Danh sách từ khóa
                    </Button>
                  </Group> */}
                  <Textarea
                    w="100%"
                    label="Điền danh sách từ khóa (chia theo dòng)"
                    placeholder="Điền danh sách từ khóa (chia theo dòng)"
                    autosize
                    minRows={4}
                    maxRows={8}
                    value={keywords} // Set the value to the 'keywords' state
                    onChange={handleKeywordsChange} // Add the onChange handler
                  />
                  {/* <Collapse in={opened} transitionDuration={100}>
                    
                  </Collapse> */}
                </Box>
              </Group>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </>
  );
}
