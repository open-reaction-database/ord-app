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

# The container's command: runs supervisord, and exits 1 when a program's exit stopped it
# (exit_on_failure.sh leaves the marker), so the exit code tells a failure from a stop the
# container was asked for. As PID 1 it passes that request, SIGTERM, on to supervisord.

# A restarted container keeps its files, and with them a marker an earlier run left.
rm -f /tmp/viewer-program-exited
supervisord -c /etc/supervisor/viewer.conf &
supervisord=$!
trap 'kill -TERM "$supervisord"' TERM INT
wait "$supervisord"
# A trapped signal ends the first wait early; this one waits for supervisord to finish.
wait "$supervisord"
[ ! -e /tmp/viewer-program-exited ]
