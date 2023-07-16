import { ColorSchemeToggle } from '../components/ColorSchemeToggle/ColorSchemeToggle';
import { Title, Text, Button, Group } from '@mantine/core';
import { Grid } from '@mantine/core';
import { RichEditor } from '../components/RichEditor';
import { useState } from 'react';

export default function HomePage() {
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const handleButtonClick = () => {
    setIsButtonClicked(!isButtonClicked);
  };
  return (
    <>
      <Grid style={{ maxWidth: '100%' }}>
        <Grid.Col span="auto" mt="xl" ml="xl" align="center">
          <Text inherit variant="gradient" component="span">
            Perfect Editor
          </Text>
        </Grid.Col>
        <Grid.Col span={6} mt="xl" ml="xl">
          <RichEditor isAnalyzeButtonClicked={false}></RichEditor>
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
