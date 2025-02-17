(() => {
  const { AdReplacer } = window.adFriend;

  const adReplacer = new AdReplacer();
  adReplacer.init().catch(console.error);
})();
