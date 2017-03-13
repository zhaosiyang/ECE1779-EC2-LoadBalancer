import { A1ClientPage } from './app.po';

describe('a1-client App', function() {
  let page: A1ClientPage;

  beforeEach(() => {
    page = new A1ClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
