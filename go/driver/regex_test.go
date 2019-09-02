package driver

import (
	"bytes"
	"testing"

	"github.com/spf13/viper"
)

func TestRegExCrypto(t *testing.T) {
	regEx := &RegEx{}
	cf := []byte(`
children:
  crypto:
    match: ^SPOTPX/([A-Z]+)-([A-Z]+)$
    driver:
      name: AggMedian
      children:
        coinBase:
          name: CoinBase
        gemini:
          name: Gemini
        kraken:
          name: Kraken
`)
	config := viper.New()
	config.SetConfigType("yaml")
	config.ReadConfig(bytes.NewBuffer(cf))
	regEx.Configure(config)
	price, err := regEx.Query([]byte("SPOTPX/ETH-USD"))
	if err != nil {
		t.Errorf("Query ETH-USD error: %s", err)
	}
	priceBig := price.Big()
	if priceBig.Cmp(PriceToBigInt(50)) == -1 || priceBig.Cmp(PriceToBigInt(1000)) == 1 {
		t.Errorf("Query ETH-USD price is way off: %s", priceBig.String())
	}
}

func TestRegExStock(t *testing.T) {
	regEx := &RegEx{}
	cf := []byte(`
children:
  stock:
    match: ^SPOTPX/([A-Z]+)$
    driver:
      name: AggMedian
      children:
        freeForexApi:
          name: FreeForexApi
        financialModelPrep:
          name: FinancialModelPrep
`)
	config := viper.New()
	config.SetConfigType("yaml")
	config.ReadConfig(bytes.NewBuffer(cf))
	regEx.Configure(config)
	price, err := regEx.Query([]byte("SPOTPX/FB"))
	if err != nil {
		t.Errorf("Query FB error: %s", err)
	}
	priceBig := price.Big()
	if priceBig.Cmp(PriceToBigInt(50)) == -1 || priceBig.Cmp(PriceToBigInt(1000)) == 1 {
		t.Errorf("Query FB price is way off: %s", priceBig.String())
	}
}