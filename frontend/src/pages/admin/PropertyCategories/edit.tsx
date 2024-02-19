import React, { useEffect, useState } from "react";
import { PropertyCategoryType } from "../../../../../backend/commonTypes";
import { Badge, Button, Card, Col, Form, Input, InputNumber, Radio, Row, Spin, message } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Editor } from '@tinymce/tinymce-react';
import { useDispatch, useSelector } from "react-redux";

import propertyCategoriesService from "../../../services/admin/property-categories.service";
import UploadMultipleFile from "../../../components/admin/UploadMultipleFile/uploadMultipleFile";
import { RootState } from "../../../redux/stores";
import NoPermission from "../../../components/admin/NoPermission/noPermission";
import AdminRolesService from "../../../services/admin/roles.service";
import { setPermissions } from "../../../redux/reduxSlices/permissionsSlice";

const EditPropertyCategories: React.FC = () => {
  
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUserPermissions = useSelector((state: RootState) => state.currentUserPermissions.permissions);

  const [viewAllowed, setViewAllowed] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);

  const [editorContent, setEditorContent] = useState<string>("");
  const [category, setCategory] = useState<PropertyCategoryType | undefined>(undefined);

  // data from child component
  const [imageUrlToRemove, setImageUrlToRemove] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          message.error('Can not find property, redirect to previous page', 3);
          navigate(-1);
          return;
        }
        const response = await propertyCategoriesService.getSingleCategory(id);

        if(response?.code === 200 && response.category) {
          setCategory(response.category);
          setLoading(false);
        } else {
          message.error(response.message, 2);
          setLoading(false);
        }

      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          message.error('Unauthorized - Please log in to access this feature.', 3);
          navigate('/admin/auth/login');
        } else {
          message.error('Error occurred while fetching property category data', 2);
          console.log('Error occurred:', err);
        }
      }
    };
    fetchData();
  }, [id, navigate])

  // if permission in redux not existed => fetch permissions
  useEffect(() =>  {
    if (currentUserPermissions?.propertyCategoriesEdit)
      return;

    const fetchData = async () => {
      try {
        const response = await AdminRolesService.getPermissions();
        if (response.code === 200) {
          if (response.permissions) {
            dispatch(setPermissions(response.permissions));
          }

          if (!response.permissions.propertyCategoriesEdit) {
            setViewAllowed(false)
          }

        } else {
          setViewAllowed(false);
        }

      } catch (err) {
        console.log("Error occurred while fetching permissions:", err);
        message.error('Error occurred, redirect to previous page', 3)
        navigate(-1);
        setViewAllowed(false);
      }
    }
    fetchData();
  }, []);

  const handleEditorChange = (content: any) => {
    const contentString = typeof content === 'string' ? content : '';
    setEditorContent(contentString);
  };

  const onFinishForm = async (data: any) => {
    try {
      if (!id) {
        console.error('Cannot get property id');
        message.error('Error occurred', 3);
        return;
      }

      const formData = new FormData();

      data.title && formData.append('title', data.title);
      data.position && formData.append('position', data.position);
      data.status && formData.append('status', data.status);
      data.parent_id && formData.append('parent_id', data.parent_id);
  
      // Append description
      editorContent && formData.append('description', editorContent);

      // Append images
      if (data.images?.length > 0) {
        data.images.forEach((imageFile: any) => {
          if (!imageFile.hasOwnProperty('uploaded') || (imageFile.hasOwnProperty('uploaded') && !imageFile.uploaded)) {
            formData.append('images', imageFile.originFileObj);
          }
        });
      }

      // Append image urls that need to remove from db
      if (imageUrlToRemove.length > 0) {
        imageUrlToRemove.forEach((imageUrl) => {
          formData.append(`images_remove`, imageUrl);
        });
      }
      
      const response = await propertyCategoriesService.updateCategory(formData, id);
      
      if (response.code === 200) {
        message.success('Property category updated successfully!', 3);
      } else {
        console.error(response.message);
        message.error('Error occurred', 3);
      }
  
    } catch (error) {
      message.error("Error occurred while updating category.");
    }
  }

  // Child component functions  
  const handleImageUrlRemove = (imageUrl: string | undefined) => {
    // Check if imageUrl is not undefined and not already in the array
    if (imageUrlToRemove !== undefined && imageUrl !== undefined) {
      setImageUrlToRemove(prevImages => [...prevImages, imageUrl]);
    }
  }

  return (
    <>
      {currentUserPermissions?.propertyCategoriesEdit || viewAllowed ? (
        <>
          {loading ? (
              <div className='d-flex justify-content-center' style={{width: "100%", height: "100vh"}}>
                <Spin tip='Loading...' size="large">
                  <div className="content" />
                </Spin>
              </div>
          ) : (
            <div className="d-flex align-items-center justify-content-center"> 
              <Form 
                layout="vertical" 
                onFinish={onFinishForm}
                method="POST"
                encType="multipart/form-data"
                className="custom-form" 
              >
                <Badge.Ribbon text={<Link to="/admin/property-categories">Back</Link>} color="purple" className="custom-ribbon">
                  <Card 
                    title="Property category information" 
                    className="custom-card" 
                    style={{marginTop: '2rem'}}
                    extra={<Link to="/admin/property-categories">Back</Link>}
                  >
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item 
                          label={<span>Post title <b className="required-txt">- required:</b></span>}
                          name='title'
                          initialValue={category?.title}
                          required
                        >
                          <Input type="text" id="title" required />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item label={`Property category description:`}>
                          <Editor
                            id="description" 
                            initialValue={category?.description}             
                            onEditorChange={handleEditorChange}
                            apiKey='zabqr76pjlluyvwebi3mqiv72r4vyshj6g0u07spd34wk1t2' // hide
                            init={{
                              toolbar_mode: 'sliding', 
                              plugins: ' anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount', 
                              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat', 
                              tinycomments_mode: 'embedded', tinycomments_author: 'Author name', mergetags_list: [ { value: 'First.Name', title: 'First Name' }, { value: 'Email', title: 'Email' }, ], 
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col sm={24} md={24} lg={10}  xl={10} xxl={10}>
                        <Form.Item label="Category status:" name='status' initialValue={category?.status}>
                          <Radio.Group>
                            <Radio value="active">Active</Radio>
                            <Radio value="inactive">Inactive</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Col>
    
                      <Col sm={24} md={24} lg={14} xl={14} xxl={14}>
                        <Form.Item label="Post position:" name='position' initialValue={category?.position}>
                          <InputNumber 
                            type="number"
                            id="position" 
                            min={0} 
                            className="custom-number-input position-input"
                            placeholder='Auto increase by default'
                          />
                        </Form.Item>
                      </Col>
    
                      <Col span={24}>
                        <UploadMultipleFile uploadedImages={category?.images} setImageUrlRemove={handleImageUrlRemove}/>
                      </Col>
                      
                      <Col span={24}>
                        <Form.Item>
                          <Button className='custom-btn-main' type="primary" htmlType="submit">
                            Update
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                </Badge.Ribbon>
              </Form>
            </div>
          )}
        </>
      ) : (
        <NoPermission permissionType='access' />
      )}
    </>
  )
}

export default EditPropertyCategories