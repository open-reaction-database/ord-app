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
import { AppDataType, type AppData } from 'store/entities/reactions/reactionData/reactionData.types.ts';
import { useFileNameHref } from 'features/reactions/ReactionEntities/useFileNameHref.ts';

interface AppDataDisplayProps {
  appData: AppData;
}

function AppDataFileDisplay({ appData }: Readonly<AppDataDisplayProps>) {
  const { fileName, href } = useFileNameHref(appData.name, appData.data);
  return (
    <a
      download={fileName}
      href={href}
    >
      {fileName}
    </a>
  );
}

export function AppDataDisplay({ appData }: Readonly<AppDataDisplayProps>) {
  switch (appData.data.type) {
    case AppDataType.Url:
    case AppDataType.Text:
    case AppDataType.Number:
      return <span>{appData.data.value}</span>;
    case AppDataType.Upload:
      return <AppDataFileDisplay appData={appData} />;
  }
}
