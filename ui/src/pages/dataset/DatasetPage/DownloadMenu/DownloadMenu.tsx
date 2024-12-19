/*
 * Copyright 2024 Open Reaction Database Project Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Button, Menu } from '@mantine/core';
import { downloadFile } from 'common/utils';
import { ChevronDownIcon, DownloadIcon } from 'common/icons';
import classes from './DownloadMenu.module.scss';

interface DownloadMenuProps {
  datasetId: number;
}

const downloadOptions = [
  { label: '.pb', format: 'binpb' },
  { label: '.pbtxt', format: 'txtpb' },
  { label: '.json', format: 'json' },
];

export function DownloadMenu({ datasetId }: Readonly<DownloadMenuProps>) {
  const handleDownload = (format: string) => {
    const url = `/datasets/${datasetId}/download?file_format=${format}`;
    downloadFile(url, `Dataset_${datasetId}`);
  };

  return (
    <Menu
      classNames={{
        dropdown: classes.dropdown,
        item: classes.menuItem,
        itemSection: classes.menuItemSection,
      }}
      width={140}
    >
      <Menu.Target>
        <Button
          className={classes.target}
          rightSection={<ChevronDownIcon />}
          title="Download dataset"
        >
          Download as
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {downloadOptions.map(option => (
          <Menu.Item
            key={option.format}
            leftSection={<DownloadIcon />}
            onClick={() => handleDownload(option.format)}
          >
            {option.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
