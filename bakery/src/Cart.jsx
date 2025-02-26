function Cart() {
  return (
      <>
          <section class="cheesecake-selection">
              <h2>Choose Your Cheesecakes</h2>
              <span>Each order includes one dozen (12) cheesecakes</span>
              <div class="cheesecake-options">
                  <label for="classic">
                      <input type="number" id="classic" name="base" value="0" min="0" />
                      Classic
                  </label>
                  <label for="chocolate">
                      <input type="number" id="chocolate" name="base" value="0" min="0" />
                      Chocolate
                  </label>
                  <label for="pumpkin">
                      <input type="number" id="pumpkin" name="base" value="0" min="0" />
                      Pumpkin
                  </label>
                  <label for="cookies_cream">
                      <input type="number" id="cookies_cream" name="base" value="0" min="0" />
                      Cookies & Cream
                  </label>
                  <label for="speculoos_cream">
                      <input type="number" id="speculoos_cream" name="base" value="0" min="0" />
                      Speculoos & Cream
                  </label>
                  <label for="nilla_cream">
                      <input type="number" id="nilla_cream" name="base" value="0" min="0" />
                      Nilla & Cream
                  </label>
                  <label for="ginger_snap">
                      <input type="number" id="ginger_snap" name="base" value="0" min="0" />
                      Ginger Snap
                  </label>
              </div>
          </section>

          <section class="topping-selection">
              <h2>Choose Your Toppings</h2>
              <span>Each topping holds 12 ounces</span>
              <div class="topping-options">
                  <label for="strawberry">
                      <input type="number" id="strawberry" name="topping" value="0" min="0" />
                      Strawberry Compote
                  </label>
                  <label for="cherry">
                      <input type="number" id="cherry" name="topping" value="0" min="0" />
                      Cherry Compote
                  </label>
                  <label for="raspberry">
                      <input type="number" id="raspberry" name="topping" value="0" min="0" />
                      Raspberry Compote
                  </label>
                  <label for="lemon">
                      <input type="number" id="lemon" name="topping" value="0" min="0" />
                      Lemon Icing
                  </label>
                  <label for="apple">
                      <input type="number" id="apple" name="topping" value="0" min="0" />
                      Apple Compote
                  </label>
                  <label for="caramel">
                      <input type="number" id="caramel" name="topping" value="0" min="0" />
                      Salted Caramel Sauce
                  </label>
                  <label for="white_chocolate">
                      <input type="number" id="white_chocolate" name="topping" value="0" min="0" />
                      White Chocolate Sauce
                  </label>
                  <label for="dark_chocolate">
                      <input type="number" id="dark_chocolate" name="topping" value="0" min="0" />
                      Dark Chocolate Sauce
                  </label>
              </div>
          </section>

          <section class="customization">
              <h2>Any Special Requests?</h2>
              <textarea id="special-requests" placeholder="Tell us how to make your cheesecake even sweeter!"></textarea>
          </section>
      </>
  );
}

export default Cart;
