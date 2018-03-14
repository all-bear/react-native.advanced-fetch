let fetchMock;

beforeEach(() => {
  jest.resetModules();

  fetchMock = jest.fn();

  global.fetch = fetchMock
});

test('it should contain some default settings', () => {
  const settings = require('../../../lib/helpers/settings').getSettings();

  expect(settings.fetch).toBeDefined();
  expect(settings.waitingForConnectionChangeInterval).toBeDefined();
});

test('it should rewrite default settings', () => {
  const getSettings = require('../../../lib/helpers/settings').getSettings;
  const setSettings = require('../../../lib/helpers/settings').setSettings;

  const fetchRewrite = jest.fn();
  const waitingForConnectionChangeIntervalRewrite = 42;

  const settingsBeforeRewrite = getSettings();

  expect(settingsBeforeRewrite.fetch).not.toBe(fetchRewrite);
  expect(settingsBeforeRewrite.waitingForConnectionChangeInterval).not.toBe(waitingForConnectionChangeIntervalRewrite);

  setSettings({
    fetch: fetchRewrite,
    waitingForConnectionChangeInterval: waitingForConnectionChangeIntervalRewrite
  });

  const settingsAfterRewrite = getSettings();

  expect(settingsAfterRewrite.fetch).toBe(fetchRewrite);
  expect(settingsAfterRewrite.waitingForConnectionChangeInterval).toBe(waitingForConnectionChangeIntervalRewrite);
});