package com.dgi.app.payload.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class RequestCreateRequest {
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateEntree;

    @NotBlank
    @Size(max = 200)
    private String raisonSocialeNomsPrenom;

    @Size(max = 50)
    private String cin;

    @Size(max = 2)
    private String pmPp; // PM or PP

    @Size(max = 1000)
    private String objet;

    private String ifValue;

    @Size(max = 50)
    private String ice;

    public RequestCreateRequest() {
        this.dateEntree = LocalDate.now(); // Default to today
    }

    public LocalDate getDateEntree() {
        return dateEntree;
    }

    public void setDateEntree(LocalDate dateEntree) {
        this.dateEntree = dateEntree;
    }

    public String getRaisonSocialeNomsPrenom() {
        return raisonSocialeNomsPrenom;
    }

    public void setRaisonSocialeNomsPrenom(String raisonSocialeNomsPrenom) {
        this.raisonSocialeNomsPrenom = raisonSocialeNomsPrenom;
    }

    public String getCin() {
        return cin;
    }

    public void setCin(String cin) {
        this.cin = cin;
    }

    public String getIfValue() {
        return ifValue;
    }

    public void setIfValue(String ifValue) {
        this.ifValue = ifValue;
    }

    public String getPmPp() {
        return pmPp;
    }

    public void setPmPp(String pmPp) {
        this.pmPp = pmPp;
    }

    public String getObjet() {
        return objet;
    }

    public void setObjet(String objet) {
        this.objet = objet;
    }

    public String getIce() {
        return ice;
    }

    public void setIce(String ice) {
        this.ice = ice;
    }
}