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

# The container's command: runs supervisord, and exits 0 only when the container was
# asked to stop (SIGTERM, which it passes on to supervisord) and supervisord stopped
# cleanly. Any other end is a failure: a program's exit (exit_on_failure.sh leaves the
# marker), or supervisord failing or stopping on its own, which keeps supervisord's code
# when it is not 0 and is 1 otherwise.

# A restarted container keeps its files, and with them a marker an earlier run left.
rm -f /tmp/viewer-program-exited
requested=
supervisord -c /etc/supervisor/viewer.conf &
supervisord=$!
trap 'requested=1; kill -TERM "$supervisord"' TERM INT
wait "$supervisord"
status=$?
if [ -n "$requested" ] && [ "$status" -gt 128 ]; then
  # The trap ended that wait early; this one waits for supervisord to finish.
  wait "$supervisord"
  status=$?
fi
if [ -n "$requested" ] && [ "$status" -eq 0 ] && [ ! -e /tmp/viewer-program-exited ]; then
  exit 0
fi
if [ "$status" -ne 0 ]; then
  exit "$status"
fi
exit 1
