#!/bin/sh
# Copyright 2026 Open Reaction Database Project Authors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# A supervisord event listener: on the first event it is sent, a program's exit, it leaves
# the marker start.sh reads and stops supervisord, which stops the other program and exits.
printf 'READY\n'
read -r _header
touch /tmp/viewer-program-exited
kill -TERM "$PPID"
