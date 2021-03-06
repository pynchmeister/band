package driver

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/bandprotocol/band/go/dt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/spf13/viper"
	"github.com/tidwall/gjson"
)

type Bancor struct{}

func Bancor_Token2ETH(symbol1 string, symbol2 string) (float64, error) {
	var url strings.Builder
	url.WriteString("https://api.bancor.network/0.1/currencies/")
	url.WriteString(strings.ToUpper(symbol1))
	url.WriteString("/ticker?displayCurrencyCode=")
	url.WriteString(strings.ToUpper(symbol2))

	var client = &http.Client{}

	res, err := client.Get(url.String())
	if err != nil {
		return 0, err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return 0, err
	}
	price := gjson.GetBytes(body, "data.price")

	if !price.Exists() {
		return 0, fmt.Errorf("key does not exist")
	}

	return price.Float(), nil
}

func (*Bancor) Configure(*viper.Viper) {}

func (*Bancor) QuerySpotPrice(symbol string) (float64, error) {
	pairs := strings.Split(symbol, "-")
	if len(pairs) != 2 {
		return 0, fmt.Errorf("spotpx: symbol %s is not valid", symbol)
	}

	if pairs[1] == "ETH" || pairs[1] == "USD" {
		return Bancor_Token2ETH(pairs[0], pairs[1])
	}

	price0, err := Bancor_Token2ETH(pairs[0], "ETH")
	if err != nil {
		return 0, err
	}

	price1, err := Bancor_Token2ETH(pairs[1], "ETH")
	if err != nil {
		return 0, err
	}

	return price0 / price1, nil
}

func (a *Bancor) Query(key []byte) dt.Answer {
	keys := strings.Split(string(key), "/")
	if len(keys) != 2 {
		return dt.NotFoundAnswer
	}
	if keys[0] == "SPOTPX" {
		value, err := a.QuerySpotPrice(keys[1])
		if err != nil {
			return dt.NotFoundAnswer
		}
		return dt.Answer{
			Option: dt.Answered,
			Value:  common.BigToHash(PriceToBigInt(value)),
		}
	}
	return dt.NotFoundAnswer
}
