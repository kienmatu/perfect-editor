import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Text, Button, Group } from '@mantine/core';
import { Grid } from '@mantine/core';
import { RichEditor } from '../components/RichEditor';
import { useState } from 'react';

export default function HomePage() {
  const [clickCount, setClickCount] = useState(0);

  const handleButtonClick = () => {
    setClickCount((c) => c + 1);
  };
  return (
    <>
      <Grid style={{ maxWidth: '100%' }}>
        <Grid.Col span="auto" mt="xl" ml="xl">
          <Text inherit variant="gradient" display="block" align="center" component="span">
            Perfect Editor
          </Text>
          <Text inherit variant="text" display="block" component="span">
            Currently support only Headings and Paragraphs
          </Text>
        </Grid.Col>
        <Grid.Col span={6} mt="xl" ml="xl">
          <RichEditor clickCount={clickCount}></RichEditor>
        </Grid.Col>
        <Grid.Col span="auto">
          <ColorSchemeToggle />
          <Group position="center" mt="xl">
            <Button onClick={handleButtonClick}>Analyze</Button>
          </Group>
        </Grid.Col>
      </Grid>
    </>
  );
}
