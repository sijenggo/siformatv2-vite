import React, { useState, useCallback } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { useQuery } from "@tanstack/react-query";
import { ambil_data, tambah_data, fetchJabPTSP, fetchJabNama, fetchIndex, formattedDateHourMinute, formattedDate, alertNotif } from './services';
import * as formik from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const fetchJabatanData = async (ptspPlus) => {
    if (ptspPlus == 1) {
      return await fetchJabPTSP();
      //return await ambil_data('SELECT * FROM ref_pejabat GROUP BY id_jabatan');
    } else {
      return await ambil_data('SELECT * FROM ref_pejabat GROUP BY id_jabatan');
    }
};

const fetchNamaPejData = async (ptspPlus, id) =>{
    if (ptspPlus == 1) {
      return await fetchJabNama(id);
    } else {
      return await ambil_data(`SELECT * FROM ref_pejabat WHERE id_jabatan = ${id}`);
    }
}

const validationSchema = Yup.object({
    nama: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Nama hanya boleh berisi huruf dan spasi.')
      .required('Nama wajib diisi.'),
    nohp: Yup.string()
      .matches(/^[0-9]+$/, 'Nomor HP hanya boleh berisi angka.')
      .required('Nomor HP wajib diisi.'),
    selIdjab: Yup.string().required('Pilih pejabat yg ditemui'),
    selIdnamapejab: Yup.string().required('Pilih pejabat yg ditemui'),
});

const SelectJabatan = ({ptspplus, onHide}) => {
	const [namaPejabat, setNamapejabat] = useState([]);
	const [selIdjab, setSelidjab] = useState('');

    const RenderNamaPejabat = ({setFieldValue, values, touched, errors}) =>{
        const selectNama = (event) => {
            const id = event.target.value;
            const nama = event.target.selectedOptions[0].getAttribute('data-nama');
            const jabatan = event.target.selectedOptions[0].getAttribute('data-jabatan');
            setFieldValue('selIdnamapejab', id); 
            setFieldValue('selNamapejab', nama);  
            setFieldValue('selNamajab', jabatan);     
        };

        if(selIdjab !== ''){
            if (ptspplus !== undefined && ptspplus == 1) {
                return (
                    <Form.Group className="mb-2 w-60">
                        <Form.Label>Pejabat yg ditemui</Form.Label>
                        <Form.Select 
                            size='lg'
                            onChange={selectNama}
                            value={values.selIdnamapejab}
                            isInvalid={touched.selIdnamapejab && !!errors.selIdnamapejab}
                        >
                            <option value="">Pilih Pejabat yang ditemui ..</option>
                            {Object.entries(namaPejabat).map(([key, value]) => (
                                <option key={key} value={value[1]} data-nama={value[0]} data-jabatan={value[2]} data-id={value[1]}>
                                    {value[0]}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.selIdnamapejab}
                        </Form.Control.Feedback>
                    </Form.Group>
                );
            } else {
                return (
                    <Form.Group className="mb-2 w-60">
                        <Form.Label>Pejabat yg ditemui</Form.Label>
                        <Form.Select 
                            size='lg'
                            onChange={selectNama} 
                            value={values.selIdnamapejab}
                            isInvalid={touched.selIdnamapejab && !!errors.selIdnamapejab}
                        >
                            <option value="">Pilih Pejabat yang ditemui ..</option>
                            {namaPejabat.map((item, index) => (
                                <option key={index} value={item.id_namapejabat} data-nama={item.nama_pejabat} data-id={item.id_namapejabat}>
                                    {item.nama_pejabat}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.selIdnamapejab}
                        </Form.Control.Feedback>
                    </Form.Group>
                );
            }
        }
        return null;
	};

    const RenderJab = ({setFieldValue, values, touched, errors}) =>{
        const { 
            data: jabatan = [], 
            isError, 
            error 
        } = useQuery({
            queryKey: ['jabatan'],
            queryFn: async () => {
              if (ptspplus !== undefined) {
                return fetchJabatanData(ptspplus);
              }
              return [];
            },
            enabled: Boolean(ptspplus !== undefined)
        });

        const showNama = useCallback(async (event) => {
            const selectedValue = event.target.value;
            const jabatan = event.target.selectedOptions[0].getAttribute('data-jabatan');
            setSelidjab(selectedValue);
            setFieldValue('selIdjab', selectedValue);
    
            if (ptspplus !== undefined) {
                const response = await fetchNamaPejData(ptspplus, selectedValue);
                setNamapejabat(response);
            }
            
        }, [selIdjab]);
    
        if (ptspplus !== undefined && ptspplus == 1) {
            return (
                <Form.Group className="mb-2 w-60">
                    <Form.Label>Pejabat yg ditemui</Form.Label>
                    <Form.Select 
                        size='lg' 
                        onChange={showNama} 
                        value={values.selIdjab}
                        isInvalid={touched.selIdjab && !!errors.selIdjab}
                    >
                        <option value="">Pilih ..</option>
                        {Object.entries(jabatan).map(([key, value]) => (
                            <option key={key} value={value[1]} data-jabatan={value[0]} data-id={value[1]}>
                                {value[0]}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.selIdjab}
                    </Form.Control.Feedback>
                </Form.Group>
            );
        } else {
            return (
                <Form.Group className="mb-2 w-60">
                    <Form.Label>Pejabat yg ditemui</Form.Label>
                    <Form.Select 
                        size='lg' 
                        onChange={showNama} 
                        value={values.selIdjab}
                        isInvalid={touched.selIdjab && !!errors.selIdjab}
                    >
                        <option value="">Pilih ..</option>
                        {jabatan.map((item, index) => (
                            <option key={index} value={item.id_jabatan} data-jabatan={item.nama_jabatan} data-id={item.id_jabatan}>
                                {item.nama_jabatan}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {errors.selIdjab}
                    </Form.Control.Feedback>
                </Form.Group>
            );
        }
    }

    const { Formik } = formik;

    const submit = async (values) => {
        let today = new Date();
        let now = formattedDateHourMinute(today);
        let tgl = formattedDate(today);
        let data = {};
        let table;
      
        try {
            if (ptspplus == 1) {
                const response = await fetchIndex();
                const newIndex = parseInt(response[0]?.nomor_index || 0) + 1;
                
                data = {
                    tujuan_nama_id: values.selIdnamapejab,
                    tujuan_nama: values.selNamapejab,
                    tujuan_jabatan_id: values.selIdjab,
                    tujuan_jabatan: values.selNamajab,
                    tanggal: tgl,
                    nomor_index: newIndex,
                    nomor_register: `${newIndex}/${today.getFullYear()}`,
                    nama: values.nama,
                    alamat: values.alamat,
                    telepon: values.nohp,
                    keperluan: 'Kunjungan Tamu',
                    diinput_oleh: 'SIFORMAT',
                    diinput_tanggal: now,
                };

                table = 'register_bukutamu';
            } else {
                data = {
                    id_jabatan: values.selIdjab,
                    nama_jabatan: values.selNamajab,
                    id_namapejabat: values.selIdnamapejab,
                    nama_pejabat: values.selNamapejab,
                    nama_pengunjung: values.nama,
                    no_hp: values.nohp,
                    alamat: values.alamat,
                    waktu: now,
                };

                table = 'kunjungan';
            }
        
            const result = await tambah_data(table, data, ptspplus);
            
            if (result.success) {
                onHide();
                Swal.fire("Terimakasih..", "", "success");
            } else {
                alertNotif('error', 'Data error', result.message, `<p class="p-0 mb-0 fs-xsmall">Error pada proses simpan data</p>`);
            }
        } catch (error) {
          console.error('Error during submit:', error);
          alertNotif('error', 'Data error', error, `<p class="p-0 mb-0 fs-xsmall">Error pada proses simpan data</p>`);
        }
    };

    return(
        <>
            <Formik
                    validationSchema={validationSchema}
                    initialValues={{
                        nama: '',
                        nohp: '',
                        alamat: '',
                        selIdjab: '',
                        selNamajab: '',
                        selIdnamapejab: '',
                        selNamapejab: '',
                    }}
                    onSubmit={(values) => submit(values)}
            >
            {({ handleSubmit, handleChange, handleBlur, values, touched, errors, setFieldValue }) => (
                <Form name='formKunjungan' noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-2 w-60" controlId="formNama">
                        <Form.Label>Nama Lengkap</Form.Label>
                        <Form.Control 
                            value={values.nama}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.nama && !!errors.nama}
                            name='nama' 
                            size='lg' 
                            type="text" 
                            placeholder="Masukan Nama Lengkap Anda .." 
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.nama}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-2 w-60" controlId="formAlamat">
                        <Form.Label>Alamat</Form.Label>
                        <Form.Control 
                            value={values.alamat} 
                            onChange={handleChange} 
                            onBlur={handleBlur}
                            name="alamat" 
                            as="textarea" 
                            placeholder="Masukkan Alamat ..." 
                            rows={3} 
                        />
                    </Form.Group>
                    <Form.Group className="mb-2 w-60" controlId="formNohp">
                        <Form.Label>Nomor Handphone</Form.Label>
                        <Form.Control 
                            value={values.nohp}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.nohp && !!errors.nohp}
                            name='nohp' 
                            size='lg' 
                            type="text"
                            placeholder="Masukan Nomor HP Anda .." 
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.nohp}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <RenderJab setFieldValue={setFieldValue} values={values} touched={touched} errors={errors} />
                    <RenderNamaPejabat setFieldValue={setFieldValue} values={values} touched={touched} errors={errors} />
                    <div className="d-grid mt-5">
                        <Button type='submit' variant="success" size="lg">
                            Simpan
                        </Button>
                    </div>
                </Form>
            )}
            </Formik>
        </>
    )
};

export default SelectJabatan;
