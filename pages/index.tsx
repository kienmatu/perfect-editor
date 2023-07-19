import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Text, Button, Group, Collapse, Box, Textarea } from '@mantine/core';
import { Grid } from '@mantine/core';
import { RichEditor } from '../components/RichEditor';
import { useState } from 'react';
import { showErrorNotification, showSuccessNotification } from '../utils/Notification';
import { useDisclosure } from '@mantine/hooks';
import { useKeywords } from '../utils/Storage';

export default function HomePage() {
  const [btnSaveClickCount, setBtnSaveClickCount] = useState(0);
  const [btnSearchClickCount, setBtnSearchClickCount] = useState(0);
  const [btnResetClickCount, setBtnResetClickCount] = useState(0);
  const [opened, { toggle }] = useDisclosure(false);
  const [keywords, setKeywords] = useKeywords();

  const handleSaveButtonClick = () => {
    setBtnSaveClickCount((c) => c + 1);
    showSuccessNotification('Đã lưu', 'Đã lưu lại nội dung vào bộ nhớ.');
  };

  const handleSearchButtonClick = () => {
    setBtnSearchClickCount((c) => c + 1);
    showErrorNotification('Chưa làm', 'Tính năng chưa được triển khai');
  };

  const handleResetButtonClick = () => {
    setBtnResetClickCount((c) => c + 1);
    showErrorNotification('Chưa làm', 'Tính năng chưa được triển khai');
  };

  const handleKeywordsChange = ({ target }) => {
    const text = target?.value;
    if (text !== undefined && text !== null) {
      setKeywords(text);
    }
  };
  return (
    <>
      <Grid style={{ maxWidth: '100%' }}>
        <Grid.Col span="auto" mt="xl" ml="xl">
          <RichEditor
            btnSaveClickCount={btnSaveClickCount}
            btnResetClickCount={btnResetClickCount}
            btnSearchClickCount={btnSearchClickCount}
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
                <span style={{ backgroundColor: '#fdd', borderBottom: '1px solid #f22' }}>
                  Từ bị lặp sẽ được bôi đỏ.
                </span>
              </Text>
              <Text inherit variant="text" display="block" component="span">
                <span style={{ backgroundColor: 'rgba(255, 217, 0, 0.5)' }}>
                  Từ khóa tìm kiếm sẽ được bôi vàng.
                </span>
              </Text>
              <Group mt="xl">
                <Button onClick={handleSaveButtonClick}>Lưu nháp</Button>
                {/* <Button onClick={handleSearchButtonClick}>Tìm từ khóa</Button> */}
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
