module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      //'nativewind/babel',     // 먼저 로드
      'expo-router/babel',    // 나중에 로드
    ],
  };
};
