
import PropTypes from "prop-types";

function Responses({ message }) {
  return (
    <div className="responses-container">
      {message && <p className="response-message">{message}</p>}
    </div>
  );
}

Responses.propTypes = {
  message: PropTypes.string,
};

export default Responses;
