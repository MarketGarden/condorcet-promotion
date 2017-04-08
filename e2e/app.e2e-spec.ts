import { CondoretPromotionPage } from './app.po';

describe('condoret-promotion App', () => {
  let page: CondoretPromotionPage;

  beforeEach(() => {
    page = new CondoretPromotionPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
