import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { ambil_data, tambah_data, fetchIndex, formattedDateHourMinute, formattedDate, alertNotif } from './services';
import * as formik from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';

const validationSchema = Yup.object({
    nama: Yup.string()
      .matches(/^[A-Za-z\s]+$/, 'Nama hanya boleh berisi huruf dan spasi.')
      .required('Nama wajib diisi.'),
    nohp: Yup.string()
      .matches(/^[0-9]+$/, 'Nomor HP hanya boleh berisi angka.')
      .required('Nomor HP wajib diisi.'),
});

const AntrianPtsp = ({ptspplus, onHide, id_loket, id_keperluan, keperluanlain}) =>{
    const { Formik } = formik;
    const submit = async(values) =>{
        let today = new Date();
        let now = formattedDateHourMinute(today);
        let tgl = formattedDate(today);
        let keperluan;
        let data = {};
        let dataptspplus = {};
        let table;

        try {
            const res_index = await ambil_data(`SELECT COUNT(*) AS indexantrian FROM tmp_antrian WHERE id_loket = ${id_loket}`);
            const res_loket = await ambil_data(`SELECT kode, nama_loket FROM sys_loket WHERE id_loket = ${id_loket}`)
            const res_keperluan = await ambil_data(`SELECT keperluan FROM sys_keperluan WHERE id_keperluan = ${id_keperluan}`)
            const newIndexAntrian = parseInt(res_index[0]?.indexantrian || 0) + 1;
            const kodeAntrian = res_loket[0]?.kode;
            data.nomor_antrian = `${kodeAntrian} - ${newIndexAntrian}`;
            data.id_loket = id_loket;
            data.id_keperluan = id_keperluan;
            data.keperluan_lain = keperluanlain || '';
            data.nama = values.nama;
            data.no_hp = values.nohp;
            data.alamat = values.alamat;
            data.waktu = now;

            keperluan = (keperluanlain.trim() === '') ? res_keperluan[0]?.keperluan : keperluanlain;

            if (parseInt(ptspplus) === 1) {
                const loketMapping = {
                    'pidana': {
                        tujuan_nama_id: '-1',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Pidana',
                        tujuan_jabatan_id: '-1',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Pidana',
                    },
                    'pidanakhusus': {
                        tujuan_nama_id: '-2',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Pidana Khusus',
                        tujuan_jabatan_id: '-2',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Pidana Khusus',
                    },
                    'perdata': {
                        tujuan_nama_id: '-3',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Perdata',
                        tujuan_jabatan_id: '-3',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Perdata',
                    },
                    'ecourt': {
                        tujuan_nama_id: '-3',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Perdata',
                        tujuan_jabatan_id: '-3',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Perdata',
                    },
                    'perdatakhusus': {
                        tujuan_nama_id: '-4',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Perdata Khusus',
                        tujuan_jabatan_id: '-4',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Perdata Khusus',
                    },
                    'hukum': {
                        tujuan_nama_id: '-5',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Hukum',
                        tujuan_jabatan_id: '-5',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Kepaniteraan Muda Hukum',
                    },
                    'umum': {
                        tujuan_nama_id: '-6',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Sub Bagian Umum',
                        tujuan_jabatan_id: '-6',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Sub Bagian Umum',
                    },
                    'informasi': {
                        tujuan_nama_id: '-7',
                        tujuan_nama: 'Pelayanan Terpadu Satu Pintu Informasi dan Pengaduan',
                        tujuan_jabatan_id: '-7',
                        tujuan_jabatan: 'Pelayanan Terpadu Satu Pintu Informasi dan Pengaduan',
                    },
                };
                
                const selectedLoket = res_loket[0]?.nama_loket;
                
                if (loketMapping[selectedLoket]) {
                    const tmp_data = loketMapping[selectedLoket];
                    dataptspplus.tujuan_nama_id = tmp_data.tujuan_nama_id;
                    dataptspplus.tujuan_nama = tmp_data.tujuan_nama;
                    dataptspplus.tujuan_jabatan_id = tmp_data.tujuan_jabatan_id;
                    dataptspplus.tujuan_jabatan = tmp_data.tujuan_jabatan;
                }

                const response = await fetchIndex();
                const newIndex = parseInt(response[0]?.nomor_index || 0) + 1;
                
                dataptspplus.tanggal = tgl;
                dataptspplus.nomor_index = newIndex;
                dataptspplus.nomor_register = `${newIndex}/${today.getFullYear()}`
                dataptspplus.nama = values.nama;
                dataptspplus.telepon = values.nohp;
                dataptspplus.alamat = values.alamat;
                dataptspplus.keperluan = keperluan;
                dataptspplus.diinput_oleh= 'SIFORMAT';
                dataptspplus.diinput_tanggal= now;

                table = 'register_bukutamu';
                const post_ptspplus = await tambah_data(table, dataptspplus, 1);

                console.log(post_ptspplus.message)
            }
            
            const post_antrian = await tambah_data('antrian', data, 0);
            const post_tmp_antrian = await tambah_data('tmp_antrian', data, 0);
            
            if (post_antrian.success && post_tmp_antrian.success) {
                onHide();
                Swal.fire("Terimakasih..", "", "success");
            } else {
                alertNotif('error', 'Data error', `${post_antrian.message} ${post_tmp_antrian.message}`, `<p class="p-0 mb-0 fs-xsmall">Error pada proses simpan data</p>`);
            }
        } catch (error) {
            console.error('Error during submit:', error);
            alertNotif('error', 'Data error', error, `<p class="p-0 mb-0 fs-xsmall">Error pada proses simpan data</p>`);
        }
    }
    return(
        <>
            <Formik
                    validationSchema={validationSchema}
                    initialValues={{
                        nama: '',
                        nohp: '',
                        alamat: '',
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

export default AntrianPtsp;