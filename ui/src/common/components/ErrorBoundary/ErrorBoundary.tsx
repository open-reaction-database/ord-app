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
import { Component } from 'react';
import { Button, Container, Title } from '@mantine/core';
import { navigate } from 'wouter/use-browser-location';
import classes from './errorBoundary.module.scss';
import { HomeIcon } from 'common/icons';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<React.PropsWithChildren<unknown>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<unknown>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleGoHome = () => {
    navigate('/datasets');
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className={classes.container}>
          <Title order={2}>Unexpected Error</Title>
          <Button
            mt="lg"
            className={classes.button}
            onClick={() => navigate('/datasets')}
          >
            <HomeIcon
              className={classes.homeIcon}
              style={{ marginRight: 8 }}
            />
            Go Home
          </Button>
        </Container>
      );
    }
    return this.props.children;
  }
}
