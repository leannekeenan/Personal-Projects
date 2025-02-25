import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className='navbar'>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </div>
      <div>
        <ul>
          <li>
            <Link to="/shop">Shop</Link>
          </li>
          <li>
              <Link to="/cart">Cart</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
