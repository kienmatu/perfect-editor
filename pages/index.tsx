import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Text, Button, Group, Box, Textarea, LoadingOverlay } from '@mantine/core';
import { Grid } from '@mantine/core';
import { RichEditor } from '../components/RichEditor';
import { useState } from 'react';
import { showSuccessNotification } from '../utils/Notification';
import { useKeywords } from '../utils/Storage';
import { Status } from '../lib';

export default function HomePage() {
  const [btnSaveClickCount, setBtnSaveClickCount] = useState(0);
  const [analyzeStatus, setAnalyzeStatus] = useState(Status.IDLE);
  const [keywords, setKeywords] = useKeywords();

  const handleSaveButtonClick = () => {
    setBtnSaveClickCount((c) => c + 1);
    showSuccessNotification('Đã lưu', 'Đã lưu lại nội dung vào bộ nhớ.');
  };

  const handleAnalyzeButtonClick = () => {
    setAnalyzeStatus((s) => Status.STARTED);
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
            setStatus={setAnalyzeStatus}
            status={analyzeStatus}
            btnSaveClickCount={btnSaveClickCount}
            keywords={keywords}
          ></RichEditor>
        </Grid.Col>
        <Grid.Col span="content" px="md">
          <Grid style={{ width: '100%' }}>
            <Grid.Col span="auto">
              <ColorSchemeToggle />
              <Text inherit variant="gradient" display="block" align="center" component="span">
                Perfect Editor
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
              <Group mt="xl">
                <Button onClick={handleSaveButtonClick}>Lưu nháp</Button>
                <Button onClick={handleAnalyzeButtonClick}>Phân tích AI</Button>
                {/* <Button variant="outline" color="orange" onClick={handleResetButtonClick}>
                  Reset
                </Button> */}
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
