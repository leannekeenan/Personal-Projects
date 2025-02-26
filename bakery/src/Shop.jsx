import React from 'react';
import './App.css';
import './index.css';

function Home() {
  return (
    <section class="menu" id="menu">
        <h2>Our Menu</h2>

        <table class="menu-table">
            <caption>Cheesecake Flavors</caption>
            <thead>
                <tr>
                    <th colspan="3">Delight in our single-serve cheesecake cups, expertly crafted by the dozen in a variety of flavors to suit every craving</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><h3>Classic</h3></td>
                    <td>Rich and silky New York-style cheesecake atop a buttery honey graham cracker crust for a timeless treat.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a></div></td>   
                </tr>
                
                <tr>
                    <td><h3>Chocolate</h3></td>
                    <td>Luxuriously smooth chocolate cheesecake layered over a crisp graham cracker crust, perfect for chocolate lovers.</td> 
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                
                <tr>
                    <td><h3>Pumpkin</h3></td>
                    <td>Velvety pumpkin cheesecake infused with warm spices, resting on a cinnamon-kissed graham cracker crust.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>

                <tr>
                    <td><h3>Cookies & Cream</h3></td>
                    <td>Rich and creamy vanilla cheesecake layered over a chocolate wafer crust, finished with a generous sprinkle of crushed chocolate cookies.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                
                <tr>
                    <td><h3>Speculoos & Cream</h3></td>
                    <td>Velvety vanilla cheesecake paired with a spiced speculoos cookie crust, topped with cookie crumbles for a warm, indulgent flavor.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a></div></td> 
                </tr>
                
                <tr>
                    <td><h3>Nilla & Cream</h3></td>
                    <td>Delicate vanilla cheesecake resting on a buttery Nilla wafer cookie crust, crowned with crunchy cookie crumbles for a nostalgic, sweet finish.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a></div></td> 
                </tr>

                <tr>
                    <td><h3>Ginger Snap</h3></td>
                    <td>A creamy, spiced cheesecake infused with hints of ginger, cinnamon, and nutmeg, set atop a crunchy ginger snap cookie crust for a warm, festive flavor in every bite</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a></div></td>   
                </tr>

            </tbody>
        </table>

        <table class="menu-table">
            <caption>Topping Options</caption>
            <thead>
                <tr>
                    <th colspan="3">Looking for a little extra? Add a handcrafted 12oz. topping for the perfect personal touch</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><h3>Strawberry Compote</h3></td>
                    <td>Sweet, tangy strawberries simmered to perfection create a vibrant compote that adds a fruity burst to every bite.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>Cherry Compote</h3></td>
                    <td>Tart cherries cooked down to a luscious, syrupy compote bring a delightful balance of tanginess and sweetness.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>Raspberry Compote</h3></td>
                    <td>Bold, tart raspberries transformed into a smooth, luxurious compote add a sophisticated and refreshing contrast.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>Lemon Icing</h3></td>
                    <td>Fresh lemons cooked into a tangy, glossy icing provide a citrusy twist with a bright zing.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>Apple Compote</h3></td>
                    <td>Warm, spiced apples simmered to perfection bring a comforting, sweet, and aromatic topping reminiscent of classic apple pie.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>Salted Caramel</h3></td>
                    <td>Rich, buttery caramel with a hint of sea salt creates an indulgent drizzle with a perfect balance of sweet and savory.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>White Chocolate Sauce</h3></td>
                    <td>Creamy, decadent white chocolate sauce adds a layer of indulgence while enhancing the luxurious texture.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
                <tr>
                    <td><h3>Dark Chocolate Sauce</h3></td>
                    <td>Velvety dark chocolate sauce with a deep, rich flavor creates a decadent finish that delights chocolate lovers.</td>
                    <td>
                      <div className='add-remove'>  
                        <a href="">+</a>
                        <input type="text" placeholder='0'/>
                        <a href="">-</a>
                      </div>
                    </td>
                </tr>
            </tbody>
        </table>
        
        
    </section>
  );

}

export default Home;
