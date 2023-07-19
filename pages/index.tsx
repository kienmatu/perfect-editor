import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Text, Button, Group } from '@mantine/core';
import { Grid } from '@mantine/core';
import { RichEditor } from '../components/RichEditor';
import { useState } from 'react';
import { showSuccessNotification } from '../utils/Notification';

export default function HomePage() {
  const [btnSaveClickCount, setBtnSaveClickCount] = useState(0);
  const [btnSearchClickCount, setBtnSearchClickCount] = useState(0);
  const [btnResetClickCount, setBtnResetClickCount] = useState(0);

  const handleSaveButtonClick = () => {
    setBtnSaveClickCount((c) => c + 1);
    showSuccessNotification('Đã lưu', 'Đã lưu lại nội dung vào bộ nhớ.');
  };
  const handleSearchButtonClick = () => {
    setBtnSearchClickCount((c) => c + 1);
  };
  const handleResetButtonClick = () => {
    setBtnResetClickCount((c) => c + 1);
  };
  return (
    <>
      <Grid style={{ maxWidth: '100%' }}>
        <Grid.Col span="auto" mt="xl" ml="xl">
          <RichEditor
            btnSaveClickCount={btnSaveClickCount}
            btnResetClickCount={btnResetClickCount}
            btnSearchClickCount={btnSearchClickCount}
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
              <Group mt="xl">
                <Button onClick={handleSaveButtonClick}>Lưu nháp</Button>
                <Button onClick={handleSearchButtonClick}>Tìm từ khóa</Button>
                <Button onClick={handleResetButtonClick}>Reset</Button>
              </Group>
            </Grid.Col>
          </Grid>
        </Grid.Col>
      </Grid>
    </>
  );
}
