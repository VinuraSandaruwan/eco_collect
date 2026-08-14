import { Link } from "react-router-dom";


function Navbar() {


  return (

    <nav
      className="navbar navbar-expand-lg bg-white shadow-sm px-4"
      style={{
        height:"70px"
      }}
    >



      <div className="navbar-brand">

        <h5
          className="mb-0"
          style={{
            color:"#198754",
            fontWeight:"700"
          }}
        >

          Smart Waste Management

        </h5>


        <small className="text-muted">
          Municipal Administration Portal
        </small>


      </div>





      {/* Right Side */}

      <div
        className="ms-auto d-flex align-items-center gap-3"
      >



        {/* Notification */}

        <button
          className="btn btn-light position-relative"
          style={{
            borderRadius:"50%",
            width:"40px",
            height:"40px"
          }}
        >

          <i className="bi bi-bell-fill text-success"></i>



          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{
              fontSize:"10px"
            }}
          >

            3

          </span>


        </button>






        {/* Profile */}

        <div
          className="dropdown"
        >

          <button
            className="btn d-flex align-items-center"
            data-bs-toggle="dropdown"
          >


            <i
              className="bi bi-person-circle me-2"
              style={{
                fontSize:"28px",
                color:"#198754"
              }}
            ></i>



            <div className="text-start">


              <span
                style={{
                  fontWeight:"600",
                  fontSize:"14px"
                }}
              >

                Admin

              </span>


              <br/>


              <small className="text-muted">

                Administrator

              </small>


            </div>



            <i className="bi bi-chevron-down ms-2"></i>


          </button>





          <ul className="dropdown-menu dropdown-menu-end">


            <li>

              <Link
                className="dropdown-item"
                to="/settings"
              >

                <i className="bi bi-gear me-2"></i>

                Settings

              </Link>


            </li>



            <li>

              <hr className="dropdown-divider"/>

            </li>




            <li>

              <button
                className="dropdown-item text-danger"
              >

                <i className="bi bi-box-arrow-right me-2"></i>

                Logout

              </button>


            </li>


          </ul>


        </div>


      </div>


    </nav>

  );

}


export default Navbar;